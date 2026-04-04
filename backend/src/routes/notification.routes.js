const router = require("express").Router();
const { protect } = require("../middlewares/auth");
const ctrl = require("../controllers/notification.controller");

router.use(protect);

// GET /api/v1/notifications
router.get("/", ctrl.getNotifications);

// GET /api/v1/notifications/unread-count
router.get("/unread-count", ctrl.getUnreadCount);

// POST /api/v1/notifications/process-reminders (Fallback if cron fails)
router.post("/process-reminders", ctrl.processPendingReminders);

// PATCH /api/v1/notifications/read  (body: { ids: [] } or empty = mark all)
router.patch("/read", ctrl.markAsRead);

// DELETE /api/v1/notifications/:id
router.delete("/:id", ctrl.deleteNotification);

module.exports = router;
