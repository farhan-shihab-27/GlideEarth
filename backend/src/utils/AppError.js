/**
 * ============================================================================
 * GLIDEEARTH — CUSTOM APPLICATION ERROR CLASS
 * ============================================================================
 * Extends the native Error with HTTP status codes and operational flags.
 * The global error handler uses these properties to build the correct
 * API response without exposing internal details to the client.
 *
 * OPERATIONAL vs PROGRAMMING ERRORS:
 * ─────────────────────────────────
 * • Operational (isOperational = true): Expected failures like 404, 400, 409.
 *   Safe to send the message to the client.
 *
 * • Programming (isOperational = false): Bugs, null references, etc.
 *   The error handler sends a generic "Internal Server Error" to the client
 *   and logs the real error for debugging.
 * ============================================================================
 */

class AppError extends Error {
  /**
   * @param {string} message    - Human-readable error message (sent to client for operational errors).
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500).
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture the stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory Methods ── Semantic constructors for common HTTP errors ──

  static badRequest(message = 'Invalid request data.') {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Authentication required.') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Access denied.') {
    return new AppError(message, 403);
  }

  static notFound(message = 'The requested resource was not found.') {
    return new AppError(message, 404);
  }

  static conflict(message = 'A resource with that identifier already exists.') {
    return new AppError(message, 409);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new AppError(message, 429);
  }

  static internal(message = 'An unexpected error occurred. Please try again later.') {
    const error = new AppError(message, 500);
    error.isOperational = false;
    return error;
  }
}

module.exports = AppError;
