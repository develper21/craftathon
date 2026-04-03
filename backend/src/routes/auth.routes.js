const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect } = require("../middlewares/auth");
const ctrl = require("../controllers/auth.controller");

// POST /api/v1/auth/register
router.post("/register",
    [
        body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
        body("firstName").notEmpty().trim().withMessage("First name required"),
        body("lastName").notEmpty().trim().withMessage("Last name required"),
        body("role").optional().isIn(["PATIENT", "CAREGIVER", "DOCTOR"]).withMessage("Invalid role"),
    ],
    validate,
    ctrl.register
);

// GET /api/v1/auth/verify-email/:token
router.get("/verify-email/:token", ctrl.verifyEmail);

// POST /api/v1/auth/login
router.post("/login",
    [
        body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password required"),
    ],
    validate,
    ctrl.login
);

// POST /api/v1/auth/refresh
router.post("/refresh",
    [body("refreshToken").notEmpty().withMessage("Refresh token required")],
    validate,
    ctrl.refreshToken
);

// POST /api/v1/auth/logout
router.post("/logout", ctrl.logout);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password",
    [body("email").isEmail().normalizeEmail()],
    validate,
    ctrl.forgotPassword
);

// POST /api/v1/auth/reset-password
router.post("/reset-password",
    [
        body("token").notEmpty().withMessage("Reset token required"),
        body("password").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
    ],
    validate,
    ctrl.resetPassword
);

// GET /api/v1/auth/me (protected)
router.get("/me", protect, ctrl.getMe);

module.exports = router;
