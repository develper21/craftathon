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

// ─── Get Adherence for Date Range ────────────────────────────────────────────
const getAdherenceRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: "startDate and endDate are required",
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const stats = await prisma.adherenceStat.findMany({
            where: {
                userId: req.user.id,
                date: { gte: start, lte: end },
            },
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

        sendSuccess(res, {
            score,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            totals,
            daily: stats,
        });
    } catch (err) {
        next(err);
    }
};

// ─── Get Full Adherence Report ────────────────────────────────────────────────
const getFullReport = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all medications for this user
        const medications = await prisma.medication.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        // Get dose logs from last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const doseLogs = await prisma.doseLog.findMany({
            where: { userId, takenAt: { gte: oneYearAgo } },
            orderBy: { takenAt: "desc" },
        });

        // Get dose schedules from last year
        const doseSchedules = await prisma.doseSchedule.findMany({
            where: { userId, scheduledAt: { gte: oneYearAgo } },
            orderBy: { scheduledAt: "desc" },
        });

        // Calculate summary
        let taken = 0;
        let missed = 0;
        const dailyHistory = {};

        // Count from dose logs
        doseLogs.forEach((log) => {
            if (log.status === "TAKEN" || log.status === "LATE") {
                taken++;
            }
        });

        // Count from dose schedules
        doseSchedules.forEach((sch) => {
            if (sch.status === "MISSED") {
                missed++;
            }
            
            const date = new Date(sch.scheduledAt).toISOString().split("T")[0];

            if (!dailyHistory[date]) {
                dailyHistory[date] = { taken: 0, missed: 0, total: 0 };
            }

            dailyHistory[date].total++;

            if (sch.status === "MISSED") {
                dailyHistory[date].missed++;
            }
        });

        // Update daily history with taken doses
        doseLogs.forEach((log) => {
            const date = new Date(log.takenAt).toISOString().split("T")[0];

            if (!dailyHistory[date]) {
                dailyHistory[date] = { taken: 0, missed: 0, total: 0 };
            }

            if (log.status === "TAKEN" || log.status === "LATE") {
                dailyHistory[date].taken++;
            }
        });

        const total = doseSchedules.length || 1;
        const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

        // Get streak
        const streak = await prisma.streak.findUnique({
            where: { userId },
        }).catch(() => null);

        // Calculate monthly trend
        const monthlyTrend = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthLogs = doseLogs.filter(log => {
                const logDate = new Date(log.takenAt);
                return logDate >= monthStart && logDate <= monthEnd;
            });

            const monthSchedules = doseSchedules.filter(sch => {
                const schDate = new Date(sch.scheduledAt);
                return schDate >= monthStart && schDate <= monthEnd;
            });

            const monthTotal = monthSchedules.length;
            const monthTaken = monthLogs.filter(log => log.status === "TAKEN" || log.status === "LATE").length;
            const monthPercentage = monthTotal > 0 ? Math.round((monthTaken / monthTotal) * 100) : 0;

            const monthName = monthStart.toLocaleString("en-US", { month: "short" });

            monthlyTrend.push({
                month: monthName,
                percentage: monthPercentage,
                taken: monthTaken,
                expected: monthTotal,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    total,
                    taken,
                    missed,
                    adherence,
                    medicationCount: medications.length,
                },
                streak: {
                    current: streak?.currentStreak || 0,
                    longest: streak?.longestStreak || 0,
                },
                dailyHistory,
                monthly: monthlyTrend,
                lastUpdated: new Date().toISOString(),
            },
        });
    } catch (err) {
        console.error("getFullReport error:", err);
        res.status(500).json({
            success: false,
            error: "Report fetch failed",
            message: err.message,
        });
    }
};

// ─── Get Adherence Report ────────────────────────────────────────────────────────
const getAdherenceReport = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get dose logs for last 30 days
        const doseLogs = await prisma.doseLog.findMany({
            where: {
                userId,
                takenAt: { gte: thirtyDaysAgo, lte: now },
            },
        });

        // Get dose schedules for last 30 days
        const doseSchedules = await prisma.doseSchedule.findMany({
            where: {
                userId,
                scheduledAt: { gte: thirtyDaysAgo, lte: now },
            },
        });

        // Calculate metrics
        const totalExpected = doseSchedules.length;
        const totalTaken = doseLogs.filter(log => log.status === "TAKEN" || log.status === "LATE").length;
        const totalMissed = doseSchedules.filter(sch => sch.status === "MISSED").length;
        
        const adherence = totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;

        // Get streak
        const streak = await prisma.streak.findUnique({
            where: { userId },
        }).catch(() => null);

        // Calculate monthly trend
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - i);
            monthDate.setDate(1);
            monthDate.setHours(0, 0, 0, 0);

            const monthStart = new Date(monthDate);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthLogs = doseLogs.filter(log => {
                const logDate = new Date(log.takenAt);
                return logDate >= monthStart && logDate <= monthEnd;
            });

            const monthSchedules = doseSchedules.filter(sch => {
                const schDate = new Date(sch.scheduledAt);
                return schDate >= monthStart && schDate <= monthEnd;
            });

            const monthTotal = monthSchedules.length;
            const monthTaken = monthLogs.filter(log => log.status === "TAKEN" || log.status === "LATE").length;
            const monthPercentage = monthTotal > 0 ? Math.round((monthTaken / monthTotal) * 100) : 0;

            const monthName = monthStart.toLocaleString("en-US", { month: "short" });

            monthlyTrend.push({
                month: monthName,
                percentage: monthPercentage,
                taken: monthTaken,
                expected: monthTotal,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                adherence,
                taken: totalTaken,
                missed: totalMissed,
                expected: totalExpected,
                streak: streak?.currentStreak || 0,
                longestStreak: streak?.longestStreak || 0,
                monthly: monthlyTrend,
                lastUpdated: new Date(),
            },
        });
    } catch (err) {
        console.error("getAdherenceReport error:", err);
        res.status(500).json({
            success: false,
            error: "Report fetch failed",
            message: err.message,
        });
    }
};

module.exports = { getAdherenceScore, getDailyAdherence, getStreak, getAdherenceRange, getAdherenceReport, getFullReport };
