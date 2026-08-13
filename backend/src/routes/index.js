/**
 * ============================================================================
 * GLIDEEARTH — API V1 ROUTE AGGREGATOR
 * ============================================================================
 * Central hub that mounts all module routers under the /api/v1 namespace.
 *
 * ROUTE MAP:
 *   /api/v1/auth        → Authentication (admin login)
 *   /api/v1/categories  → Category browsing (public)
 *   /api/v1/products    → Product catalog (public)
 *   /api/v1/orders      → Checkout & order tracking (public)
 *   /api/v1/coupons     → Coupon validation (public)
 *   /api/v1/payments    → Payment gateway webhooks (public — IPN)
 *   /api/v1/admin       → Admin dashboard (JWT + role protected)
 * ============================================================================
 */

const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const categoryRoutes = require('../modules/categories/category.routes');
const productRoutes = require('../modules/products/product.routes');
const orderRoutes = require('../modules/orders/order.routes');
const couponRoutes = require('../modules/coupons/coupon.routes');
const paymentRoutes = require('../modules/payments/payment.routes');
const adminRoutes = require('../modules/admin/admin.routes');

const router = Router();

// ── Module Route Mounting ────────────────────────────────────────────

// Public: Authentication (admin login)
router.use('/auth', authRoutes);

// Public: Storefront data
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

// Public: Checkout flow & coupon validation
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);

// Public: Payment gateway webhooks (IPN — no auth by design)
router.use('/payments', paymentRoutes);

// Protected: Admin dashboard (JWT + role enforcement applied inside admin.routes.js)
router.use('/admin', adminRoutes);

module.exports = router;

