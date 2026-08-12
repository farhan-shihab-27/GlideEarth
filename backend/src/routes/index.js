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
const productRoutes = require('../modules/products/product.routes');

const router = Router();

// ── Module Route Mounting ────────────────────────────────────────────

router.use('/products', productRoutes);

// Future modules:
// router.use('/categories', categoryRoutes);
// router.use('/orders', orderRoutes);
// router.use('/customers', customerRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/admin', adminRoutes);

module.exports = router;
