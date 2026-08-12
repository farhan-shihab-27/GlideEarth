/**
 * ============================================================================
 * GLIDEEARTH — AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * ============================================================================
 * Central security middleware module responsible for authenticating requests
 * via JSON Web Tokens (JWT) and enforcing Role-Based Access Control (RBAC).
 *
 * DESIGN & ARCHITECTURE NOTES:
 * ────────────────────────────
 * 1. Bearer Token Extraction Pattern:
 *    - Following RFC 6750 HTTP Authorization scheme, tokens are passed in the
 *      `Authorization` header formatted as: `Bearer <token>`.
 *    - The middleware validates header presence, verifies the prefix, splits
 *      the header string, and extracts the raw JWT signature for verification.
 *
 * 2. Attachment to `req.admin` (vs `req.user`):
 *    - Glideearth segregates administrative staff authentication from public
 *      customer authentication to avoid identity confusion and security risks.
 *    - Attaching decoded credentials specifically to `req.admin` ensures that
 *      administrative context (`id`, `email`, `role`) is cleanly isolated from
 *      customer sessions (`req.user`), preventing accidental cross-domain
 *      authorization bugs.
 *
 * 3. Role-Based Access Control (RBAC):
 *    - `requireRole(...roles)` is a higher-order middleware factory.
 *    - It returns a middleware function that compares the authenticated user's
 *      role (`req.admin.role`) against an array of permitted roles.
 *    - If the user's role is not authorized, execution halts with a 403 Forbidden
 *      AppError before reaching the business logic layer.
 *
 * USAGE EXAMPLES IN ROUTE FILES:
 * ──────────────────────────────
 * ```js
 * const { authenticate, requireRole } = require('../../middleware/auth');
 *
 * // Protect all routes below with authentication
 * router.use(authenticate);
 *
 * // Route accessible by any authenticated admin staff member
 * router.get('/profile', adminController.getProfile);
 *
 * // Route restricted to 'admin' and 'superadmin' roles
 * router.post('/products', requireRole('admin', 'superadmin'), productController.createProduct);
 *
 * // Route restricted strictly to 'superadmin' role
 * router.delete('/products/:id', requireRole('superadmin'), productController.deleteProduct);
 * ```
 * ============================================================================
 */

const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { config } = require('../config');

/**
 * Express middleware to authenticate requests using JWT Bearer tokens.
 *
 * Extracts the JWT from the `Authorization` header, verifies its cryptographic
 * signature using `config.jwt.secret`, and attaches the decoded payload
 * (`{ id, email, role }`) to `req.admin`.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware callback
 * @throws {AppError} 401 Unauthorized if token is missing, invalid, or expired
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication required. Please provide a valid token.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw AppError.unauthorized('Authentication required. Please provide a valid token.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw AppError.unauthorized('Invalid or expired token. Please log in again.');
    }

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Higher-order middleware factory for Role-Based Access Control (RBAC).
 *
 * Enforces role restrictions by verifying that `req.admin.role` is included within
 * the allowed roles list. MUST be placed after the `authenticate` middleware.
 *
 * @param {...(string|string[])} roles - Permitted role strings or arrays of role strings
 * @returns {import('express').RequestHandler} Express middleware function
 * @throws {AppError} 403 Forbidden if `req.admin.role` is not permitted
 */
const requireRole = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    try {
      if (!req.admin || !req.admin.role || !allowedRoles.includes(req.admin.role)) {
        throw AppError.forbidden('You do not have permission to perform this action.');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, requireRole };
