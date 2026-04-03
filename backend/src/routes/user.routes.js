const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middlewares/validate");
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/user.controller");

// All routes protected
router.use(protect);

// GET /api/v1/users/profile
router.get("/profile", ctrl.getProfile);

// PUT /api/v1/users/profile
router.put("/profile",
    [
        body("firstName").optional().trim().notEmpty(),
        body("lastName").optional().trim().notEmpty(),
        body("phone").optional().isMobilePhone(),
        body("dateOfBirth").optional().isISO8601(),
        body("timezone").optional().isString(),
    ],
    validate,
    ctrl.updateProfile
);

// PUT /api/v1/users/change-password
router.put("/change-password",
    [
        body("currentPassword").notEmpty().withMessage("Current password required"),
        body("newPassword").isLength({ min: 8 }).withMessage("New password min 8 chars"),
    ],
    validate,
    ctrl.changePassword
);

// POST /api/v1/users/device-token
router.post("/device-token",
    [
        body("token").notEmpty().withMessage("Device token required"),
        body("platform").isIn(["android", "ios", "web"]).withMessage("Invalid platform"),
    ],
    validate,
    ctrl.registerDeviceToken
);

// DELETE /api/v1/users/account
router.delete("/account", ctrl.deleteAccount);

// Admin only
router.get("/", restrictTo("ADMIN"), ctrl.listUsers);

module.exports = router;
