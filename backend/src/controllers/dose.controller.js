const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const { calcLateness, calcAdherenceScore, startOfDay, endOfDay } = require("../utils/scheduleHelper");
const { notifyCaregivers } = require("../services/notification.service");
const { updateAdherenceStats, updateStreak } = require("../services/adherence.service");

// ─── Log a Dose (Check-in) ────────────────────────────────────────────────────
const logDose = async (req, res, next) => {
    try {
        const { doseScheduleId, medicationId, notes, takenAt: takenAtStr } = req.body;
        const takenAt = takenAtStr ? new Date(takenAtStr) : new Date();

        let schedule = null;
        if (doseScheduleId) {
            schedule = await prisma.doseSchedule.findFirst({
                where: { id: doseScheduleId, userId: req.user.id },
            });
            if (!schedule) throw new AppError("Dose schedule not found.", 404);
            if (schedule.status === "TAKEN") throw new AppError("This dose has already been logged.", 409);
        }

        // Calculate lateness
        const scheduledAt = schedule?.scheduledAt || takenAt;
        const { isLate, minutesLate } = calcLateness(scheduledAt, takenAt);
        const status = isLate ? "LATE" : "TAKEN";

        // Create dose log
        const doseLog = await prisma.doseLog.create({
            data: {
                userId: req.user.id,
                medicationId: medicationId || schedule?.medicationId,
                doseScheduleId: doseScheduleId || null,
                takenAt,
                status,
                minutesLate,
                notes,
            },
        });

        // Update schedule status
        if (schedule) {
            await prisma.doseSchedule.update({
                where: { id: schedule.id },
                data: { status },
            });
        }

        // Update adherence stats and streak asynchronously
        updateAdherenceStats(req.user.id, takenAt).catch(() => { });
        updateStreak(req.user.id).catch(() => { });

        sendCreated(res, { doseLog }, `Dose logged as ${status}.`);
    } catch (err) {
        next(err);
    }
};

// ─── Skip a Dose ──────────────────────────────────────────────────────────────
const skipDose = async (req, res, next) => {
    try {
        const { doseScheduleId, medicationId, reason } = req.body;

        const schedule = await prisma.doseSchedule.findFirst({
            where: { id: doseScheduleId, userId: req.user.id },
        });
        if (!schedule) throw new AppError("Dose schedule not found.", 404);
        if (schedule.status !== "PENDING") throw new AppError("Dose is already logged.", 409);

        const [log] = await Promise.all([
            prisma.doseLog.create({
                data: {
                    userId: req.user.id,
                    medicationId: medicationId || schedule.medicationId,
                    doseScheduleId,
                    takenAt: new Date(),
                    status: "SKIPPED",
                    notes: reason,
                },
            }),
            prisma.doseSchedule.update({ where: { id: schedule.id }, data: { status: "SKIPPED" } }),
        ]);

        updateAdherenceStats(req.user.id, new Date()).catch(() => { });

        sendSuccess(res, { log }, "Dose marked as skipped.");
    } catch (err) {
        next(err);
    }
};

// ─── Get Dose History ─────────────────────────────────────────────────────────
const getDoseHistory = async (req, res, next) => {
    try {
        const { medicationId, startDate, endDate, status, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
            userId: req.user.id,
            ...(medicationId && { medicationId }),
            ...(status && { status }),
            ...(startDate || endDate
                ? {
                    takenAt: {
                        ...(startDate && { gte: new Date(startDate) }),
                        ...(endDate && { lte: new Date(endDate) }),
                    }
                }
                : {}),
        };

        const [logs, total] = await Promise.all([
            prisma.doseLog.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { takenAt: "desc" },
                include: { medication: { select: { name: true, dosage: true } } },
            }),
            prisma.doseLog.count({ where }),
        ]);

        sendSuccess(res, { logs, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        next(err);
    }
};

// ─── Get Missed Doses ─────────────────────────────────────────────────────────
const getMissedDoses = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const now = new Date();

        const missed = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                status: { in: ["PENDING", "MISSED"] },
                windowEnd: {
                    lte: now,
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                },
            },
            include: { medication: { select: { name: true, dosage: true, color: true } } },
            orderBy: { scheduledAt: "desc" },
        });

        sendSuccess(res, { missed, total: missed.length });
    } catch (err) {
        next(err);
    }
};

// ─── Get Pending Doses for Today ──────────────────────────────────────────────
const getPendingDoses = async (req, res, next) => {
    try {
        const now = new Date();
        const todayEnd = endOfDay(now);

        const pending = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                status: "PENDING",
                scheduledAt: { lte: todayEnd },
                windowEnd: { gte: now },
            },
            include: { medication: { select: { name: true, dosage: true, color: true, instructions: true } } },
            orderBy: { scheduledAt: "asc" },
        });

        sendSuccess(res, { pending, total: pending.length });
    } catch (err) {
        next(err);
    }
};

module.exports = { logDose, skipDose, getDoseHistory, getMissedDoses, getPendingDoses };
