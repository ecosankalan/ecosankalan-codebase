/**
 * middleware/errorHandler.js
 * Global error handling middleware.
 *
 * Why centralize errors?
 * Without this, every controller needs its own try/catch with its own
 * error response format. That leads to inconsistent API responses.
 * With this, controllers just throw errors and this catches them all.
 *
 * Express identifies error-handling middleware by the 4-argument signature:
 *   (err, req, res, next)  ← the 'err' first param is the signal
 *
 * Usage in controllers:
 *   throw new Error('Something broke')           → 500
 *   const err = new Error('Not found'); err.statusCode = 404; throw err;
 */

const logger = require('../config/logger');

/**
 * Catches errors thrown anywhere in the route/controller chain.
 * Must be registered LAST in app.js (after all routes).
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error server-side (never expose stack traces to clients)
  logger.error(`${err.message} | Route: ${req.method} ${req.originalUrl}`, err);

  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again.';

  // --- Handle specific Mongoose / JWT errors gracefully ---

  // Mongoose: invalid ObjectId (e.g. /users/not-a-valid-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message = `An account with this ${field} already exists.`;
  }

  // Mongoose: validation failed
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // In production, hide internal error details for 500s
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal server error occurred.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only include stack trace in development for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches requests to routes that don't exist.
 * Register AFTER all routes but BEFORE errorHandler.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err); // pass to errorHandler above
};

module.exports = { errorHandler, notFound };
