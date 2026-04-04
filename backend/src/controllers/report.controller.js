const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { getWeekRange, calcAdherenceScore, formatDate } = require("../utils/scheduleHelper");
const { sendEmail, emailTemplates } = require("../utils/email");
const logger = require("../utils/logger");

// ─── Get Weekly Report ────────────────────────────────────────────────────────
const getWeeklyReport = async (req, res, next) => {
    try {
        const { weekStart } = req.query;
        let { start, end } = getWeekRange(weekStart ? new Date(weekStart) : new Date());

        // Check if report already cached
        let report = await prisma.weeklyReport.findFirst({
            where: { userId: req.user.id, weekStartDate: start },
        });

        if (!report) {
            // Build report on the fly
            report = await buildWeeklyReport(req.user.id, start, end);
        }

        sendSuccess(res, { report });
    } catch (err) {
        next(err);
    }
};

// ─── Get All Weekly Reports History ───────────────────────────────────────────
const getReportHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [reports, total] = await Promise.all([
            prisma.weeklyReport.findMany({
                where: { userId: req.user.id },
                skip,
                take: Number(limit),
                orderBy: { weekStartDate: "desc" },
            }),
            prisma.weeklyReport.count({ where: { userId: req.user.id } }),
        ]);

        sendSuccess(res, { reports, total });
    } catch (err) {
        next(err);
    }
};

// ─── Get Patient Report (for caregiver) ──────────────────────────────────────
const getPatientReport = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const { weekStart } = req.query;

        // Verify caregiver link
        const link = await prisma.caregiverLink.findFirst({
            where: { caregiverId: req.user.id, patientId, isAccepted: true },
        });
        if (!link) throw new AppError("Not linked to this patient.", 403);

        const { start, end } = getWeekRange(weekStart ? new Date(weekStart) : new Date());

        let report = await prisma.weeklyReport.findFirst({
            where: { userId: patientId, weekStartDate: start },
        });
        if (!report) {
            report = await buildWeeklyReport(patientId, start, end);
        }

        sendSuccess(res, { report });
    } catch (err) {
        next(err);
    }
};

// ─── Email report to user ─────────────────────────────────────────────────────
const emailWeeklyReport = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const { start, end } = getWeekRange();
        const report = await buildWeeklyReport(req.user.id, start, end);

        const { subject, html } = emailTemplates.weeklyReport(
            user.firstName,
            report.adherenceScore,
            report.totalTaken,
            report.totalMissed,
            report.totalScheduled,
            formatDate(start),
            formatDate(end)
        );

        await sendEmail(user.email, subject, html);
        await prisma.weeklyReport.update({ where: { id: report.id }, data: { sentAt: new Date() } });

        sendSuccess(res, {}, "Weekly report emailed successfully.");
    } catch (err) {
        next(err);
    }
};

// ─── Internal: Build weekly report ───────────────────────────────────────────
const buildWeeklyReport = async (userId, start, end) => {
    const stats = await prisma.adherenceStat.findMany({
        where: { userId, date: { gte: start, lte: end } },
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

    // Best/worst day
    let bestDay = null, worstDay = null;
    if (stats.length > 0) {
        const sorted = [...stats].sort((a, b) => b.adherenceScore - a.adherenceScore);
        bestDay = formatDate(sorted[0].date);
        worstDay = formatDate(sorted[sorted.length - 1].date);
    }

    const report = await prisma.weeklyReport.upsert({
        where: { userId_weekStartDate: { userId, weekStartDate: start } },
        create: {
            userId, weekStartDate: start, weekEndDate: end,
            totalScheduled: totals.scheduled, totalTaken: totals.taken,
            totalMissed: totals.missed, totalLate: totals.late,
            adherenceScore: score, bestDay, worstDay,
            reportData: { daily: stats },
        },
        update: {
            totalScheduled: totals.scheduled, totalTaken: totals.taken,
            totalMissed: totals.missed, totalLate: totals.late,
            adherenceScore: score, bestDay, worstDay,
            reportData: { daily: stats },
        },
    });

    return report;
};

// ─── Get Comprehensive Adherence Report (30 days) ────────────────────────────
const getAdherenceReport = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

        // Get dose logs and schedules
        const allDoseLogs = await prisma.doseLog.findMany({
            where: {
                userId,
                takenAt: { gte: oneYearAgo, lte: now },
            },
        });

        const allDoseSchedules = await prisma.doseSchedule.findMany({
            where: {
                userId,
                scheduledAt: { gte: oneYearAgo, lte: now },
            },
        });

        // Get streak
        const streak = await prisma.streak.findUnique({
            where: { userId },
        }).catch(err => {
            logger.warn(`Streak not found for user ${userId}`);
            return null;
        });

        // Filter 30-day data
        const thirtyDayDoseLogs = allDoseLogs.filter(log => {
            const logDate = new Date(log.takenAt);
            return logDate >= thirtyDaysAgo && logDate <= now;
        });

        const thirtyDayDoseSchedules = allDoseSchedules.filter(sch => {
            const schDate = new Date(sch.scheduledAt);
            return schDate >= thirtyDaysAgo && schDate <= now;
        });

        // Calculate 30-day metrics
        const totalExpected = thirtyDayDoseSchedules.length;
        const totalTaken = thirtyDayDoseLogs.filter(log => 
            log.status === "TAKEN" || log.status === "LATE"
        ).length;
        const totalMissed = thirtyDayDoseSchedules.filter(sch => 
            sch.status === "MISSED"
        ).length;

        const adherencePercentage = totalExpected > 0 
            ? Math.round((totalTaken / totalExpected) * 100) 
            : 0;

        // Calculate monthly trend
        const monthlyTrend = [];
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() - i);
            monthDate.setDate(1);
            monthDate.setHours(0, 0, 0, 0);

            const monthStart = new Date(monthDate);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

            const monthDoseLogs = allDoseLogs.filter(log => {
                const logDate = new Date(log.takenAt);
                return logDate >= monthStart && logDate <= monthEnd;
            });

            const monthSchedules = allDoseSchedules.filter(sch => {
                const schDate = new Date(sch.scheduledAt);
                return schDate >= monthStart && schDate <= monthEnd;
            });

            const monthTotal = monthSchedules.length;
            const monthTakenCount = monthDoseLogs.filter(log => 
                log.status === "TAKEN" || log.status === "LATE"
            ).length;
            const monthPercentage = monthTotal > 0 
                ? Math.round((monthTakenCount / monthTotal) * 100) 
                : 0;

            const monthName = monthStart.toLocaleString("en-US", { month: "short" });

            monthlyTrend.push({
                month: monthName,
                percentage: monthPercentage,
                taken: monthTakenCount,
                expected: monthTotal,
            });
        }

        sendSuccess(res, {
            adherence: adherencePercentage,
            taken: totalTaken,
            missed: totalMissed,
            expected: totalExpected,
            streak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            monthly: monthlyTrend,
            lastUpdated: new Date(),
        });
    } catch (err) {
        logger.error(`Failed to generate adherence report: ${err.message}`);
        res.status(500).json({
            success: false,
            message: "Failed to generate adherence report",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
};

module.exports = { getWeeklyReport, getReportHistory, getPatientReport, emailWeeklyReport, buildWeeklyReport, getAdherenceReport };
