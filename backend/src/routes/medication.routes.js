const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const ctrl = require("../controllers/medication.controller");

router.use(protect);

// POST /api/v1/medications
router.post("/",
    [
        body("name").notEmpty().trim().withMessage("Medication name required"),
        body("dosage").notEmpty().withMessage("Dosage required"),
        body("frequency").isIn(["DAILY", "TWICE_DAILY", "THREE_TIMES_DAILY", "FOUR_TIMES_DAILY", "WEEKLY", "CUSTOM"]).withMessage("Invalid frequency"),
        body("times").isArray({ min: 1 }).withMessage("At least one time required"),
        body("startDate").isISO8601().withMessage("Valid start date required"),
    ],
    validate,
    ctrl.createMedication
);

// GET /api/v1/medications
router.get("/", ctrl.getMedications);

// GET /api/v1/medications/today
router.get("/today", ctrl.getTodaySchedule);

// GET /api/v1/medications/weekly
router.get("/weekly", ctrl.getWeeklySchedule);

// GET /api/v1/medications/:id
router.get("/:id", ctrl.getMedication);

// PUT /api/v1/medications/:id
router.put("/:id", ctrl.updateMedication);

// DELETE /api/v1/medications/:id
router.delete("/:id", ctrl.deleteMedication);

module.exports = router;
