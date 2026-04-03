const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { startOfDay, endOfDay, getWeekRange, calcAdherenceScore, formatDate } = require("../utils/scheduleHelper");

// ─── Get Overall Adherence Score ──────────────────────────────────────────────
const getAdherenceScore = async (req, res, next) => {
    try {
        const { period = "30" } = req.query; // days
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - Number(period));

        const stats = await prisma.adherenceStat.findMany({
            where: { userId: req.user.id, date: { gte: since } },
            orderBy: { date: "asc" },
        });

        const totals = stats.reduce(
            (acc, s) => ({
                scheduled: acc.scheduled + s.scheduled,
                taken: acc.taken + s.taken,
                missed: acc.missed + s.missed,
                late: acc.late + s.late,
                skipped: acc.skipped + s.skipped,
            }),
            { scheduled: 0, taken: 0, missed: 0, late: 0, skipped: 0 }
        );

        const score = calcAdherenceScore(totals.taken + totals.late, totals.scheduled);

        sendSuccess(res, { score, period: Number(period), totals, daily: stats });
    } catch (err) {
        next(err);
    }
};

// ─── Get Daily Adherence ──────────────────────────────────────────────────────
const getDailyAdherence = async (req, res, next) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date();
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const [scheduled, taken, missed, late, skipped] = await Promise.all([
            prisma.doseSchedule.count({ where: { userId: req.user.id, scheduledAt: { gte: dayStart, lte: dayEnd } } }),
            prisma.doseLog.count({ where: { userId: req.user.id, takenAt: { gte: dayStart, lte: dayEnd }, status: "TAKEN" } }),
            prisma.doseSchedule.count({ where: { userId: req.user.id, scheduledAt: { gte: dayStart, lte: dayEnd }, status: "MISSED" } }),
            prisma.doseLog.count({ where: { userId: req.user.id, takenAt: { gte: dayStart, lte: dayEnd }, status: "LATE" } }),
            prisma.doseLog.count({ where: { userId: req.user.id, takenAt: { gte: dayStart, lte: dayEnd }, status: "SKIPPED" } }),
        ]);

        const score = calcAdherenceScore(taken + late, scheduled);

        sendSuccess(res, { date: formatDate(dayStart), scheduled, taken, missed, late, skipped, score });
    } catch (err) {
        next(err);
    }
};

// ─── Get Streak Info ──────────────────────────────────────────────────────────
const getStreak = async (req, res, next) => {
    try {
        const streak = await prisma.streak.findUnique({ where: { userId: req.user.id } });
        sendSuccess(res, { streak: streak || { currentStreak: 0, longestStreak: 0, lastActiveDay: null } });
    } catch (err) {
        next(err);
    }
};

// ─── Get Adherence Stats (range) ──────────────────────────────────────────────
const getAdherenceRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) throw new AppError("startDate and endDate are required.", 400);

        const stats = await prisma.adherenceStat.findMany({
            where: {
                userId: req.user.id,
                date: { gte: new Date(startDate), lte: new Date(endDate) },
            },
            orderBy: { date: "asc" },
        });

        sendSuccess(res, { stats });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAdherenceScore, getDailyAdherence, getStreak, getAdherenceRange };
