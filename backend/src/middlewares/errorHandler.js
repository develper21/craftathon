const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Prisma known errors
    if (err.code === "P2002") {
        statusCode = 409;
        message = `Duplicate value for field: ${err.meta?.target?.join(", ")}`;
    }
    if (err.code === "P2025") {
        statusCode = 404;
        message = "Record not found";
    }
    if (err.code === "P2003") {
        statusCode = 400;
        message = "Foreign key constraint failed";
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Validation errors
    if (err.name === "ValidationError") {
        statusCode = 422;
    }

    // Log server errors
    if (statusCode >= 500) {
        logger.error(`${statusCode} - ${message}`, { stack: err.stack, url: req.url });
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        ...(err.errors && { errors: err.errors }),
    });
};

module.exports = { errorHandler };
