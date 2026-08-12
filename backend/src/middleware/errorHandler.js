/**
 * ============================================================================
 * GLIDEEARTH — GLOBAL ERROR HANDLING MIDDLEWARE
 * ============================================================================
 * The last line of defense. Every unhandled error in the application —
 * whether thrown from a controller, service, repository, or middleware —
 * flows through this single handler.
 *
 * RESPONSIBILITIES:
 * ─────────────────
 * 1. Distinguish between operational errors (client mistakes, expected
 *    failures) and programming errors (bugs, unexpected crashes).
 *
 * 2. Transform raw PostgreSQL and system errors into clean, standardized
 *    API responses that the frontend can consume.
 *
 * 3. Log the full error stack in development for debugging, while sending
 *    only safe, generic messages to the client in production.
 *
 * 4. NEVER crash the server. NEVER leak stack traces or DB details
 *    to the client in production.
 * ============================================================================
 */

const AppError = require('../utils/AppError');
const { sendError } = require('../utils/apiResponse');

// ============================================================================
// SPECIFIC ERROR TRANSFORMERS
// ============================================================================

/**
 * Handle PostgreSQL-specific error codes.
 * See: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
function handlePgError(err) {
  switch (err.code) {
    // 23505 — unique_violation
    case '23505': {
      // Extract the constraint name for a meaningful message
      const detail = err.detail || '';
      const field = detail.match(/\(([^)]+)\)/)?.[1] || 'field';
      return new AppError(`A record with that ${field} already exists.`, 409);
    }

    // 23503 — foreign_key_violation
    case '23503': {
      const constraint = err.constraint || 'reference';
      return new AppError(`Cannot complete this action: related record not found (${constraint}).`, 400);
    }

    // 23502 — not_null_violation
    case '23502': {
      const column = err.column || 'field';
      return new AppError(`The "${column}" field is required and cannot be empty.`, 400);
    }

    // 23514 — check_violation
    case '23514': {
      return new AppError('The provided data violates a validation constraint.', 400);
    }

    // 57014 — query_cancelled (statement_timeout)
    case '57014': {
      return new AppError('The request took too long to process. Please try again.', 408);
    }

    // 53300 — too_many_connections
    case '53300': {
      console.error('[CRITICAL] PostgreSQL connection limit reached!');
      return new AppError('Service temporarily unavailable. Please try again shortly.', 503);
    }

    default:
      return null; // Not a recognized PG error — fall through to generic handler
  }
}

/**
 * Handle JSON syntax errors from Express's body parser.
 */
function handleJsonSyntaxError(err) {
  if (err.type === 'entity.parse.failed') {
    return new AppError('Invalid JSON in request body.', 400);
  }
  return null;
}

// ============================================================================
// MAIN ERROR HANDLER
// ============================================================================

/**
 * Global error-handling middleware.
 * Express identifies this as an error handler by its 4-parameter signature.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, _next) {
  // Default to 500 if no status code is set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // ── DEVELOPMENT: Full transparency for debugging ──────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      ...(err.code && { pgCode: err.code }),
    });

    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: {
        stack: err.stack,
        ...(err.code && { pgCode: err.code }),
      },
    });
  }

  // ── PRODUCTION: Transform known errors, hide unknown ones ─────────

  // 1. Try PostgreSQL error transformation
  const pgError = err.code ? handlePgError(err) : null;
  if (pgError) {
    return sendError(res, {
      statusCode: pgError.statusCode,
      message: pgError.message,
    });
  }

  // 2. Try JSON parse error transformation
  const jsonError = handleJsonSyntaxError(err);
  if (jsonError) {
    return sendError(res, {
      statusCode: jsonError.statusCode,
      message: jsonError.message,
    });
  }

  // 3. Known operational errors (AppError instances) — safe to forward
  if (err.isOperational) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // 4. Unknown/programming errors — log everything, send generic message
  console.error('[UNHANDLED ERROR]', err);

  return sendError(res, {
    statusCode: 500,
    message: 'An unexpected error occurred. Please try again later.',
  });
}

module.exports = globalErrorHandler;
