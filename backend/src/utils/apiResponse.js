/**
 * ============================================================================
 * GLIDEEARTH — STANDARDIZED API RESPONSE HELPERS
 * ============================================================================
 * Every single API response from this backend flows through these helpers
 * to ensure a consistent JSON contract for the frontend:
 *
 *   {
 *     "success": true | false,
 *     "message": "Human-readable status message",
 *     "data":    { ... } | null,
 *     "meta":    { ... } | undefined    // pagination, counts, etc.
 *   }
 *
 * The frontend team can rely on `success` as the single boolean to check,
 * `data` for the payload, and `message` for toast/snackbar text.
 * ============================================================================
 */

/**
 * Send a successful response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {number}  [options.statusCode=200] - HTTP status code.
 * @param {string}  [options.message='Success'] - Human-readable message.
 * @param {*}       [options.data=null] - Response payload.
 * @param {object}  [options.meta] - Optional metadata (pagination, totals, etc.).
 */
function sendSuccess(res, { statusCode = 200, message = 'Success', data = null, meta } = {}) {
  const response = {
    success: true,
    message,
    data,
  };

  // Only include `meta` key if provided — keeps responses clean
  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response.
 *
 * @param {import('express').Response} res
 * @param {object}  options
 * @param {number}  [options.statusCode=500] - HTTP status code.
 * @param {string}  [options.message='An unexpected error occurred.'] - Error message.
 * @param {object}  [options.errors] - Optional field-level validation errors.
 */
function sendError(res, { statusCode = 500, message = 'An unexpected error occurred.', errors } = {}) {
  const response = {
    success: false,
    message,
    data: null,
  };

  // Include field-level errors for 400 validation failures
  if (errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

module.exports = { sendSuccess, sendError };
