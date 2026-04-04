const cron = require("node-cron");
const logger = require("../utils/logger");
const prisma = require("../config/prisma");
const { notifyCaregivers, sendDoseReminder } = require("../services/notification.service");
const { sendEmail, emailTemplates } = require("../utils/email");
const { updateAdherenceStats } = require("../services/adherence.service");
const { generateFutureDoseSchedules } = require("../controllers/medication.controller");
const { buildWeeklyReport } = require("../controllers/report.controller");
const { getWeekRange } = require("../utils/scheduleHelper");

/**
 * Start all cron jobs
 */
const startCronJobs = () => {

    // ── 1. Mark overdue doses as MISSED (every 1 min) ──────────────────────────
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // Find doses that have passed their 5-minute window
            const overdue = await prisma.doseSchedule.findMany({
                where: { 
                    status: "PENDING", 
                    windowEnd: { lte: now } 
                },
                include: { 
                    medication: { select: { id: true, name: true } }, 
                    user: { select: { id: true, email: true, firstName: true } } 
                },
            });

            if (overdue.length === 0) return;

            logger.info(`[CRON] Found ${overdue.length} overdue dose(s) to mark as MISSED`);

            // Bulk update to MISSED
            const ids = overdue.map((d) => d.id);
            await prisma.doseSchedule.updateMany({ 
                where: { id: { in: ids } }, 
                data: { status: "MISSED" } 
            });

            // Process each missed dose
            const userDates = new Set();
            for (const dose of overdue) {
                const timeStr = dose.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                logger.info(`[CRON] 📋 Marked ${dose.medication.name} as MISSED for user ${dose.user.id} (scheduled: ${timeStr})`);

                // Update adherence stats (once per user per day)
                const key = `${dose.userId}|${dose.scheduledAt.toISOString().split("T")[0]}`;
                if (!userDates.has(key)) {
                    userDates.add(key);
                    updateAdherenceStats(dose.userId, dose.scheduledAt).catch(() => { });
                }

                // Notify PATIENT about missed dose
                if (dose.user.email) {
                    try {
                        const { subject, html } = emailTemplates.patientMissedDose(
                            dose.user.firstName || "Patient",
                            dose.medication.name,
                            timeStr
                        );
                        await sendEmail(dose.user.email, subject, html);
                        logger.info(`[CRON] ✉️  Sent missed dose email to patient ${dose.user.email} for ${dose.medication.name}`);
                    } catch (err) {
                        logger.error(`[CRON] ❌ Failed to send patient email: ${err.message}`);
                    }
                }

                // Notify CAREGIVERS about missed dose
                notifyCaregivers(dose.user.id, dose.medication.name, timeStr).catch((err) => {
                    logger.error(`[CRON] ❌ Failed to notify caregivers: ${err.message}`);
                });
            }
        } catch (err) {
            logger.error(`[CRON] ❌ markMissed error: ${err.message}`);
        }
    });

    // ── 2. Send dose reminders 15 min before scheduled time (every 3 min) ──────
    cron.schedule("*/3 * * * *", async () => {
        try {
            const now = new Date();
            const reminderFrom = new Date(now.getTime() - 5 * 60000);  // 5 min ago (for safety)
            const reminderTo = new Date(now.getTime() + 18 * 60000);   // next 18 min

            const upcoming = await prisma.doseSchedule.findMany({
                where: {
                    status: "PENDING",
                    scheduledAt: { gte: reminderFrom, lte: reminderTo },
                },
                include: { 
                    medication: { select: { id: true, name: true } }, 
                    user: { select: { id: true, email: true, firstName: true } },
                    doseLog: true  // Check if already logged
                },
            });

            if (upcoming.length > 0) {
                logger.info(`[CRON] 🔔 Found ${upcoming.length} upcoming dose(s) for reminders`);
            }

            for (const dose of upcoming) {
                // Skip if already taken
                if (dose.doseLog && dose.doseLog.length > 0) {
                    continue;
                }

                const scheduledTimeStr = dose.scheduledAt.toISOString().substring(11, 16);
                logger.info(`[CRON] 📤 Sending reminder for ${dose.medication.name} to ${dose.user.email} (scheduled: ${scheduledTimeStr})`);
                
                sendDoseReminder(
                    dose.user.id,
                    dose.medication.name,
                    scheduledTimeStr
                ).catch((err) => {
                    logger.error(`[CRON] ❌ Error sending reminder: ${err.message}`);
                });
            }
        } catch (err) {
            logger.error(`[CRON] ❌ reminder error: ${err.message}`);
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

    logger.info("All cron jobs registered.");
};

module.exports = { startCronJobs };
