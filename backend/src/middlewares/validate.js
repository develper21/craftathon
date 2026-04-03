const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Runs after express-validator chains — throws if there are errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
        return next(new AppError("Validation failed", 422, messages));
    }
    next();
};

module.exports = { validate };
