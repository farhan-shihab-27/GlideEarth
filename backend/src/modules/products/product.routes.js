/**
 * ============================================================================
 * GLIDEEARTH — PRODUCT ROUTES
 * ============================================================================
 * Defines the RESTful endpoints for the Product module.
 * Each route maps an HTTP method + path to a controller method,
 * wrapped in asyncHandler for automatic error forwarding.
 *
 * ROUTE ORDER MATTERS:
 * ────────────────────
 * Static routes (e.g., /featured) must be defined BEFORE dynamic
 * parameter routes (e.g., /:id), otherwise Express will treat
 * "featured" as an identifier value.
 * ============================================================================
 */

const { Router } = require('express');
const productController = require('./product.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = Router();

// ── Static routes first ──────────────────────────────────────────────

/**
 * GET /api/v1/products/featured
 * Fetch featured products for the homepage.
 */
router.get('/featured', asyncHandler(productController.getFeaturedProducts));

// ── Collection routes ────────────────────────────────────────────────

/**
 * GET /api/v1/products
 * Fetch paginated, filterable product listing for the storefront.
 */
router.get('/', asyncHandler(productController.getProducts));

// ── Dynamic parameter routes last ────────────────────────────────────

/**
 * GET /api/v1/products/:id
 * Fetch a single product by slug or UUID (Product Detail Page).
 */
router.get('/:id', asyncHandler(productController.getProductByIdentifier));

module.exports = router;
