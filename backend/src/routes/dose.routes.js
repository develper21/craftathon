const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const ctrl = require("../controllers/dose.controller");

router.use(protect);

// POST /api/v1/doses/log  — check-in (take a dose)
router.post("/log",
    [
        body("medicationId").optional().isUUID(),
        body("doseScheduleId").optional().isUUID(),
        body("takenAt").optional().isISO8601().withMessage("Invalid date format"),
    ],
    validate,
    ctrl.logDose
);

// POST /api/v1/doses/skip
router.post("/skip",
    [
        body("doseScheduleId").isUUID().withMessage("Schedule ID required"),
    ],
    validate,
    ctrl.skipDose
);

// GET /api/v1/doses/history
router.get("/history", ctrl.getDoseHistory);

// GET /api/v1/doses/missed
router.get("/missed", ctrl.getMissedDoses);

// GET /api/v1/doses/pending
router.get("/pending", ctrl.getPendingDoses);

module.exports = router;
