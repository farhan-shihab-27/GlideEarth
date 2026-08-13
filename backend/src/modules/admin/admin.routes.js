/**
 * ============================================================================
 * GLIDEEARTH — ADMIN ROUTE AGGREGATOR
 * ============================================================================
 * Central hub for all admin-only API routes. Authentication and role-based
 * access control are applied HERE at the top level, so individual admin
 * sub-modules don't need to repeat the middleware.
 *
 * SECURITY MODEL:
 * ────────────────
 * Every request hitting /api/v1/admin/* must pass through:
 *   1. `authenticate` — Verifies the JWT, attaches req.admin
 *   2. `requireRole(...)` — Ensures the admin has the required role
 *
 * This single enforcement point eliminates the risk of a developer
 * forgetting to protect a new admin route.
 *
 * ROUTE STRUCTURE:
 * ────────────────
 *   /api/v1/admin/products   → Admin product CRUD (create, update, soft delete)
 *   /api/v1/admin/orders     → Admin order management (list, status updates)
 * ============================================================================
 */

const { Router } = require('express');
const { authenticate, requireRole } = require('../../middleware/auth');

// Sub-module routes
const adminProductRoutes = require('./products/admin-product.routes');
const adminOrderRoutes = require('./orders/admin-order.routes');

const router = Router();

// ── Apply authentication & authorization to ALL admin routes ─────────
// Every route mounted below this line requires a valid JWT token
// from an admin user with 'super_admin', 'admin', or 'editor' role.
router.use(authenticate);
router.use(requireRole('super_admin', 'admin', 'editor'));

// ── Mount admin sub-modules ──────────────────────────────────────────
router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);

// Future admin modules:
// router.use('/customers', adminCustomerRoutes);
// router.use('/coupons', adminCouponRoutes);
// router.use('/analytics', adminAnalyticsRoutes);

module.exports = router;
