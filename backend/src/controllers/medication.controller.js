const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const { generateDoseSchedule, startOfDay } = require("../utils/scheduleHelper");

// ─── Create Medication ────────────────────────────────────────────────────────
const createMedication = async (req, res, next) => {
    try {
        const {
            name, brandName, dosage, unit, frequency, customDays,
            times, startDate, endDate, instructions,
            refillDate, totalQuantity, color,
        } = req.body;

        const medication = await prisma.medication.create({
            data: {
                userId: req.user.id,
                name, brandName, dosage,
                unit: unit || "mg",
                frequency,
                customDays: customDays || [],
                times: times || [],
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                instructions, refillDate: refillDate ? new Date(refillDate) : null,
                totalQuantity: totalQuantity || null,
                remainingQty: totalQuantity || null,
                color,
            },
        });

        // Generate dose schedules for next 7 days
        await generateFutureDoseSchedules(medication, 7);

        sendCreated(res, { medication }, "Medication added successfully.");
    } catch (err) {
        next(err);
    }
};

// ─── Get All Medications ──────────────────────────────────────────────────────
const getMedications = async (req, res, next) => {
    try {
        const { isActive } = req.query;
        const where = {
            userId: req.user.id,
            ...(isActive !== undefined && { isActive: isActive === "true" }),
        };

        const medications = await prisma.medication.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        sendSuccess(res, { medications, total: medications.length });
    } catch (err) {
        next(err);
    }
};

// ─── Get Single Medication ────────────────────────────────────────────────────
const getMedication = async (req, res, next) => {
    try {
        const medication = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: {
                doseSchedules: {
                    orderBy: { scheduledAt: "desc" },
                    take: 10,
                },
            },
        });
        if (!medication) throw new AppError("Medication not found.", 404);
        sendSuccess(res, { medication });
    } catch (err) {
        next(err);
    }
};

// ─── Update Medication ────────────────────────────────────────────────────────
const updateMedication = async (req, res, next) => {
    try {
        const existing = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!existing) throw new AppError("Medication not found.", 404);

        const allowedFields = [
            "name", "brandName", "dosage", "unit", "frequency", "customDays", "times",
            "startDate", "endDate", "instructions", "refillDate", "totalQuantity", "remainingQty", "color", "isActive",
        ];
        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                if (["startDate", "endDate", "refillDate"].includes(field) && req.body[field]) {
                    updateData[field] = new Date(req.body[field]);
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        const medication = await prisma.medication.update({
            where: { id: req.params.id },
            data: updateData,
        });

        // Regenerate upcoming schedules if timing changed
        if (req.body.times || req.body.frequency || req.body.customDays) {
            await prisma.doseSchedule.deleteMany({
                where: { medicationId: medication.id, scheduledAt: { gte: new Date() }, status: "PENDING" },
            });
            await generateFutureDoseSchedules(medication, 7);
        }

        sendSuccess(res, { medication }, "Medication updated.");
    } catch (err) {
        next(err);
    }
};

// ─── Delete (deactivate) Medication ──────────────────────────────────────────
const deleteMedication = async (req, res, next) => {
    try {
        const existing = await prisma.medication.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!existing) throw new AppError("Medication not found.", 404);

        await prisma.medication.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });
        sendSuccess(res, {}, "Medication deactivated.");
    } catch (err) {
        next(err);
    }
};

// ─── Today's Schedule ─────────────────────────────────────────────────────────
const getTodaySchedule = async (req, res, next) => {
    try {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setUTCHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setUTCHours(23, 59, 59, 999);

        const schedules = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                scheduledAt: { gte: todayStart, lte: todayEnd },
            },
            include: {
                medication: { select: { id: true, name: true, dosage: true, color: true, instructions: true } },
                doseLog: true,
            },
            orderBy: { scheduledAt: "asc" },
        });

        sendSuccess(res, { schedules, date: todayStart.toISOString().split("T")[0] });
    } catch (err) {
        next(err);
    }
};

// ─── Weekly Schedule ──────────────────────────────────────────────────────────
const getWeeklySchedule = async (req, res, next) => {
    try {
        const { startDate } = req.query;
        const start = startDate ? new Date(startDate) : new Date();
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        end.setUTCHours(23, 59, 59, 999);

        const schedules = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                scheduledAt: { gte: start, lte: end },
            },
            include: {
                medication: { select: { id: true, name: true, dosage: true, color: true } },
                doseLog: true,
            },
            orderBy: { scheduledAt: "asc" },
        });

        sendSuccess(res, { schedules, from: start, to: end });
    } catch (err) {
        next(err);
    }
};

// ─── Internal: generate dose schedules for N days ────────────────────────────
const generateFutureDoseSchedules = async (medication, days = 7) => {
    const schedules = [];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + i);

        // Skip dates before startDate or after endDate
        if (date < new Date(medication.startDate)) continue;
        if (medication.endDate && date > new Date(medication.endDate)) break;

        const doses = generateDoseSchedule(medication, date);
        for (const dose of doses) {
            schedules.push({
                userId: medication.userId,
                medicationId: medication.id,
                scheduledAt: dose.scheduledAt,
                windowStart: dose.windowStart,
                windowEnd: dose.windowEnd,
                status: "PENDING",
            });
        }
    }

    if (schedules.length > 0) {
        // Avoid duplicates
        await prisma.doseSchedule.createMany({
            data: schedules,
            skipDuplicates: true,
        });
    }
};

module.exports = {
    createMedication, getMedications, getMedication,
    updateMedication, deleteMedication,
    getTodaySchedule, getWeeklySchedule,
    generateFutureDoseSchedules,
};
