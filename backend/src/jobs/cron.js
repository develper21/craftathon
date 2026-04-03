const cron = require("node-cron");
const logger = require("../utils/logger");
const prisma = require("../config/prisma");
const { notifyCaregivers, sendDoseReminder } = require("../services/notification.service");
const { updateAdherenceStats } = require("../services/adherence.service");
const { generateFutureDoseSchedules } = require("../controllers/medication.controller");
const { buildWeeklyReport } = require("../controllers/report.controller");
const { getWeekRange } = require("../utils/scheduleHelper");

/**
 * Start all cron jobs
 */
const startCronJobs = () => {

    // ── 1. Mark overdue doses as MISSED (every 10 min) ──────────────────────────
    cron.schedule("*/10 * * * *", async () => {
        try {
            const now = new Date();

            const overdue = await prisma.doseSchedule.findMany({
                where: { status: "PENDING", windowEnd: { lte: now } },
                include: { medication: { select: { name: true } }, user: { select: { id: true } } },
            });

            if (overdue.length === 0) return;

            // Bulk update to MISSED
            const ids = overdue.map((d) => d.id);
            await prisma.doseSchedule.updateMany({ where: { id: { in: ids } }, data: { status: "MISSED" } });

            logger.info(`Marked ${overdue.length} dose(s) as MISSED`);

            // Update adherence stats & notify caregivers
            const userDates = new Set();
            for (const dose of overdue) {
                const key = `${dose.userId}|${dose.scheduledAt.toISOString().split("T")[0]}`;
                if (!userDates.has(key)) {
                    userDates.add(key);
                    updateAdherenceStats(dose.userId, dose.scheduledAt).catch(() => { });
                }

                // Notify caregivers
                const timeStr = dose.scheduledAt.toISOString().replace("T", " ").substring(0, 16) + " UTC";
                notifyCaregivers(dose.userId, dose.medication.name, timeStr).catch(() => { });
            }
        } catch (err) {
            logger.error(`[CRON] markMissed error: ${err.message}`);
        }
    });

    // ── 2. Send dose reminders 15 min before scheduled time (every 5 min) ───────
    cron.schedule("*/5 * * * *", async () => {
        try {
            const now = new Date();
            const reminderFrom = now;
            const reminderTo = new Date(now.getTime() + 20 * 60000); // next 20 min

            const upcoming = await prisma.doseSchedule.findMany({
                where: {
                    status: "PENDING",
                    scheduledAt: { gte: reminderFrom, lte: reminderTo },
                },
                include: { medication: { select: { name: true } } },
            });

            for (const dose of upcoming) {
                sendDoseReminder(
                    dose.userId,
                    dose.medication.name,
                    dose.scheduledAt.toISOString().substring(11, 16) + " UTC"
                ).catch(() => { });
            }

            if (upcoming.length > 0) {
                logger.info(`[CRON] Sent ${upcoming.length} dose reminder(s)`);
            }
        } catch (err) {
            logger.error(`[CRON] reminder error: ${err.message}`);
        }
    });

    // ── 3. Generate next 7-day dose schedules for active medications (daily at midnight) ──
    cron.schedule("0 0 * * *", async () => {
        try {
            logger.info("[CRON] Generating future dose schedules...");

            const medications = await prisma.medication.findMany({
                where: { isActive: true },
            });

            let generated = 0;
            for (const med of medications) {
                await generateFutureDoseSchedules(med, 7);
                generated++;
            }

            logger.info(`[CRON] Generated schedules for ${generated} medication(s)`);
        } catch (err) {
            logger.error(`[CRON] scheduleGen error: ${err.message}`);
        }
    });

    // ── 4. Generate weekly reports every Sunday at 8pm ─────────────────────────
    cron.schedule("0 20 * * 0", async () => {
        try {
            logger.info("[CRON] Generating weekly reports...");
            const { start, end } = getWeekRange(new Date());

            const users = await prisma.user.findMany({
                where: { isActive: true, role: "PATIENT" },
                select: { id: true },
            });

            for (const user of users) {
                await buildWeeklyReport(user.id, start, end).catch(() => { });
            }

            logger.info(`[CRON] Weekly reports generated for ${users.length} patient(s)`);
        } catch (err) {
            logger.error(`[CRON] weeklyReport error: ${err.message}`);
        }
    });

    // ── 5. Clean up expired refresh tokens (daily at 2am) ─────────────────────
    cron.schedule("0 2 * * *", async () => {
        try {
            const deleted = await prisma.refreshToken.deleteMany({
                where: { expiresAt: { lte: new Date() } },
            });
            logger.info(`[CRON] Cleaned ${deleted.count} expired refresh tokens`);
        } catch (err) {
            logger.error(`[CRON] tokenClean error: ${err.message}`);
        }
    });

    logger.info("✅ All cron jobs registered.");
};

module.exports = { startCronJobs };
