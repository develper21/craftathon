const prisma = require("../config/prisma");
const { sendSuccess } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

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

module.exports = { getNotifications, markAsRead, deleteNotification, getUnreadCount };
