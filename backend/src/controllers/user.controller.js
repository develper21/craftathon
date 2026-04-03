const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

// ─── Get Profile ──────────────────────────────────────────────────────────────
const getProfile = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, email: true, firstName: true, lastName: true,
                phone: true, role: true, isEmailVerified: true,
                createdAt: true, profile: true,
                streak: { select: { currentStreak: true, longestStreak: true, lastActiveDay: true } },
            },
        });
        if (!user) throw new AppError("User not found.", 404);
        sendSuccess(res, { user });
    } catch (err) {
        next(err);
    }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, allergies, conditions, timezone, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone }),
                profile: {
                    update: {
                        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
                        ...(gender && { gender }),
                        ...(bloodGroup && { bloodGroup }),
                        ...(allergies && { allergies }),
                        ...(conditions && { conditions }),
                        ...(timezone && { timezone }),
                        ...(avatarUrl && { avatarUrl }),
                    },
                },
            },
            select: {
                id: true, email: true, firstName: true, lastName: true, phone: true,
                role: true, profile: true,
            },
        });
        sendSuccess(res, { user }, "Profile updated.");
    } catch (err) {
        next(err);
    }
};

// ─── Change Password ──────────────────────────────────────────────────────────
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
            throw new AppError("Current password is incorrect.", 400);
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

        sendSuccess(res, {}, "Password changed successfully.");
    } catch (err) {
        next(err);
    }
};

// ─── Register Device Token (Push Notifications) ───────────────────────────────
const registerDeviceToken = async (req, res, next) => {
    try {
        const { token, platform } = req.body;

        await prisma.deviceToken.upsert({
            where: { token },
            update: { userId: req.user.id, isActive: true, platform },
            create: { token, userId: req.user.id, platform },
        });

        sendSuccess(res, {}, "Device token registered.");
    } catch (err) {
        next(err);
    }
};

// ─── Admin: List all users ────────────────────────────────────────────────────
const listUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const where = role ? { role } : {};
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: Number(skip),
                take: Number(limit),
                orderBy: { createdAt: "desc" },
                select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
            }),
            prisma.user.count({ where }),
        ]);

        sendSuccess(res, { users, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        next(err);
    }
};

// ─── Delete account ───────────────────────────────────────────────────────────
const deleteAccount = async (req, res, next) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { isActive: false },
        });
        sendSuccess(res, {}, "Account deactivated.");
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, updateProfile, changePassword, registerDeviceToken, listUsers, deleteAccount };
