const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { getWeekRange, calcAdherenceScore, formatDate } = require("../utils/scheduleHelper");
const { sendEmail, emailTemplates } = require("../utils/email");

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

module.exports = { getWeeklyReport, getReportHistory, getPatientReport, emailWeeklyReport, buildWeeklyReport };
