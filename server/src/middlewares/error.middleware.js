import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

/** 404 handler — placed after all routes */
export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Normalizes known error types (Mongoose, JWT, ApiError) into a consistent
 * ApiError, then sends a sanitized JSON response. Stack traces are only
 * logged server-side — never sent to the client, especially in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';
    const errors = [];

    if (error.name === 'ValidationError') {
      // Mongoose schema validation error
      statusCode = 400;
      message = 'Validation failed';
      Object.values(error.errors).forEach((e) => errors.push({ field: e.path, message: e.message }));
    } else if (error.code === 11000) {
      // Mongo duplicate key
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message = `${field} already in use`;
      errors.push({ field, message });
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid identifier supplied';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message, errors, error.stack);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${error.message}\n${error.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${error.statusCode} ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(env.isProd ? {} : { stack: error.stack }),
  });
}
