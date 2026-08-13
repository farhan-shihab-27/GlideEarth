/**
 * ============================================================================
 * GLIDEEARTH — API V1 ROUTE AGGREGATOR
 * ============================================================================
 * Central hub that mounts all module routers under the /api/v1 namespace.
 *
 * As the application grows, new modules are registered here:
 *   router.use('/categories', categoryRoutes);
 *   router.use('/orders', orderRoutes);
 *   router.use('/customers', customerRoutes);
 *   router.use('/admin', adminRoutes);
 * ============================================================================
 */

const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const categoryRoutes = require('../modules/categories/category.routes');
const productRoutes = require('../modules/products/product.routes');
const orderRoutes = require('../modules/orders/order.routes');
const adminRoutes = require('../modules/admin/admin.routes');

const router = Router();

// ── Module Route Mounting ────────────────────────────────────────────

// Public: Authentication (login)
router.use('/auth', authRoutes);

// Public: Storefront data
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

// Public: Checkout flow
router.use('/orders', orderRoutes);

// Protected: Admin dashboard (JWT + role enforcement applied inside admin.routes.js)
router.use('/admin', adminRoutes);

// Future modules:
// router.use('/customers', customerRoutes);
// router.use('/coupons', couponRoutes);

module.exports = router;
