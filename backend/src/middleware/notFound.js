/**
 * ============================================================================
 * GLIDEEARTH — 404 NOT FOUND MIDDLEWARE
 * ============================================================================
 * Catches any request that doesn't match a defined route and returns
 * a standardized 404 response. Must be registered AFTER all route handlers
 * but BEFORE the global error handler.
 * ============================================================================
 */

const AppError = require('../utils/AppError');

function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
}

module.exports = notFoundHandler;
