const router = require("express").Router();
const { protect } = require("../middlewares/auth");
const ctrl = require("../controllers/adherence.controller");

router.use(protect);

// GET /api/v1/adherence/score?period=30
router.get("/score", ctrl.getAdherenceScore);

// GET /api/v1/adherence/daily?date=2025-01-01
router.get("/daily", ctrl.getDailyAdherence);

// GET /api/v1/adherence/streak
router.get("/streak", ctrl.getStreak);

// GET /api/v1/adherence/range?startDate=&endDate=
router.get("/range", ctrl.getAdherenceRange);

module.exports = router;
