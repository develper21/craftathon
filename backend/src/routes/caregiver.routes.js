const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/caregiver.controller");

router.use(protect);

// POST /api/v1/caregivers/link  — caregiver sends link request to patient
router.post("/link",
    [body("patientEmail").isEmail().normalizeEmail().withMessage("Valid patient email required")],
    validate,
    restrictTo("CAREGIVER", "DOCTOR"),
    ctrl.sendLinkRequest
);

// POST /api/v1/caregivers/link/respond  — patient accepts/rejects link
router.post("/link/respond",
    [
        body("linkId").isUUID(),
        body("accept").isBoolean(),
    ],
    validate,
    restrictTo("PATIENT"),
    ctrl.respondToLinkRequest
);

// GET /api/v1/caregivers/link/pending  — patient gets their pending requests
router.get("/link/pending", restrictTo("PATIENT"), ctrl.getPendingLinkRequests);

// GET /api/v1/caregivers/patients  — caregiver sees their patient list
router.get("/patients", restrictTo("CAREGIVER", "DOCTOR"), ctrl.getMyPatients);

// GET /api/v1/caregivers/patients/:patientId  — detailed patient view
router.get("/patients/:patientId", restrictTo("CAREGIVER", "DOCTOR"), ctrl.getPatientDetail);

// DELETE /api/v1/caregivers/patients/:patientId  — unlink patient
router.delete("/patients/:patientId", restrictTo("CAREGIVER", "DOCTOR"), ctrl.unlinkPatient);

// GET /api/v1/caregivers/alerts
router.get("/alerts", restrictTo("CAREGIVER", "DOCTOR"), ctrl.getCaregiverAlerts);

// PATCH /api/v1/caregivers/alerts/:alertId/read
router.patch("/alerts/:alertId/read", restrictTo("CAREGIVER", "DOCTOR"), ctrl.markAlertRead);

module.exports = router;
