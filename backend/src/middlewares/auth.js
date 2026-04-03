const { verifyAccessToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const prisma = require("../config/prisma");

/**
 * Protect routes — must be logged in
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("No token provided. Please log in.", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        // Verify user still exists & is active
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, isActive: true, firstName: true, lastName: true },
        });

        if (!user) throw new AppError("User no longer exists.", 401);
        if (!user.isActive) throw new AppError("Account is deactivated.", 403);

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Restrict to specific roles
 * @param  {...string} roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action.", 403));
        }
        next();
    };
};

module.exports = { protect, restrictTo };
