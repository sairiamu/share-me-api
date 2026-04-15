import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 * Should be used as the last middleware in Express
 */
export const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Default error response
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
        errors = err.errors;
    } else if (err.code === 'ER_DUP_ENTRY') {
        status = 409;
        message = 'Duplicate entry - resource already exists';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized - invalid credentials';
    } else if (err.name === 'ForbiddenError') {
        status = 403;
        message = 'Forbidden - access denied';
    }

    res.status(status).json({
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.path}`
    });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
