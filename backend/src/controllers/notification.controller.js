const prisma = require("../config/prisma");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const { sendDoseReminder, notifyCaregivers } = require("../services/notification.service");
const logger = require("../utils/logger");

// ─── Get Notifications ────────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
    try {
        const { isRead, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
            userId: req.user.id,
            ...(isRead !== undefined && { isRead: isRead === "true" }),
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where, skip, take: Number(limit), orderBy: { createdAt: "desc" },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
        ]);

        sendSuccess(res, { notifications, total, unreadCount, page: Number(page) });
    } catch (err) {
        next(err);
    }
};

// ─── Mark as Read ─────────────────────────────────────────────────────────────
const markAsRead = async (req, res, next) => {
    try {
        const { ids } = req.body; // array of notification IDs, or empty = mark all

        if (ids && ids.length > 0) {
            await prisma.notification.updateMany({
                where: { id: { in: ids }, userId: req.user.id },
                data: { isRead: true },
            });
        } else {
            await prisma.notification.updateMany({
                where: { userId: req.user.id, isRead: false },
                data: { isRead: true },
            });
        }
        sendSuccess(res, {}, "Notifications marked as read.");
    } catch (err) {
        next(err);
    }
};

// ─── Delete Notification ──────────────────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
    try {
        const notif = await prisma.notification.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!notif) throw new AppError("Notification not found.", 404);

        await prisma.notification.delete({ where: { id: req.params.id } });
        sendSuccess(res, {}, "Notification deleted.");
    } catch (err) {
        next(err);
    }
};

// ─── Get Unread Count ─────────────────────────────────────────────────────────
const getUnreadCount = async (req, res, next) => {
    try {
        const count = await prisma.notification.count({
            where: { userId: req.user.id, isRead: false },
        });
        sendSuccess(res, { unreadCount: count });
    } catch (err) {
        next(err);
    }
};

// ─── Fallback: Process Pending Reminders (triggered by frontend if cron fails) ──
const processPendingReminders = async (req, res, next) => {
    try {
        const now = new Date();
        const reminderFrom = new Date(now.getTime() - 5 * 60000);  // 5 min ago (for safety)
        const reminderTo = new Date(now.getTime() + 18 * 60000);   // next 18 min

        const upcoming = await prisma.doseSchedule.findMany({
            where: {
                userId: req.user.id,
                status: "PENDING",
                scheduledAt: { gte: reminderFrom, lte: reminderTo },
            },
            include: { 
                medication: { select: { id: true, name: true } }, 
                user: { select: { id: true, email: true, firstName: true } },
                doseLog: true
            },
        });

        if (upcoming.length === 0) {
            return sendSuccess(res, { processed: 0, message: "No pending reminders" });
        }

        let processed = 0;
        for (const dose of upcoming) {
            // Skip if already taken
            if (dose.doseLog && dose.doseLog.length > 0) {
                continue;
            }

            const scheduledTimeStr = dose.scheduledAt.toISOString().substring(11, 16);
            logger.info(`[FALLBACK] 📤 Sending reminder for ${dose.medication.name} to ${dose.user.email} (scheduled: ${scheduledTimeStr})`);
            
            try {
                await sendDoseReminder(
                    dose.user.id,
                    dose.medication.name,
                    scheduledTimeStr
                );
                processed++;
            } catch (err) {
                logger.error(`[FALLBACK] ❌ Error sending reminder: ${err.message}`);
            }
        }

        sendSuccess(res, { processed, total: upcoming.length, message: `Processed ${processed}/${upcoming.length} reminders` });
    } catch (err) {
        next(err);
    }
};

module.exports = { getNotifications, markAsRead, deleteNotification, getUnreadCount, processPendingReminders };
