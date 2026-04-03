const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/report.controller");

router.use(protect);

// GET /api/v1/reports/weekly?weekStart=YYYY-MM-DD
router.get("/weekly", ctrl.getWeeklyReport);

// GET /api/v1/reports/history
router.get("/history", ctrl.getReportHistory);

// POST /api/v1/reports/email  — email current week's report to self
router.post("/email", ctrl.emailWeeklyReport);

// GET /api/v1/reports/patient/:patientId/weekly  — caregiver views patient report
router.get("/patient/:patientId/weekly",
    restrictTo("CAREGIVER", "DOCTOR"),
    ctrl.getPatientReport
);

module.exports = router;
