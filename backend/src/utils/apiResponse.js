/**
 * Standardised API response helpers
 */

const sendSuccess = (res, data = {}, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const sendCreated = (res, data = {}, message = "Created successfully") => {
    return sendSuccess(res, data, message, 201);
};

const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
    const body = { success: false, message };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
};

const sendPaginated = (res, data, total, page, limit, message = "Success") => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    });
};

module.exports = { sendSuccess, sendCreated, sendError, sendPaginated };
