/**
 * ============================================================================
 * GLIDEEARTH — PRODUCT CONTROLLER (HTTP Interface Layer)
 * ============================================================================
 * Thin layer responsible for:
 *   1. Extracting data from the HTTP request (query params, route params).
 *   2. Delegating to the Service layer for business logic.
 *   3. Formatting the response using the standardized API envelope.
 *
 * Controllers must NOT contain business logic, SQL queries, or direct
 * database access. If you find an `if` statement that isn't about HTTP
 * concerns, it belongs in the Service layer.
 * ============================================================================
 */

const productService = require('./product.service');
const { sendSuccess } = require('../../utils/apiResponse');

const productController = {
  /**
   * GET /api/v1/products
   *
   * Fetch a paginated, filterable list of active storefront products.
   * This is the "HOT PATH" — the first API call after an ad click.
   *
   * Query Parameters:
   *   ?page=1         - Page number (1-indexed)
   *   ?limit=12       - Products per page (max 50)
   *   ?category=slug  - Filter by category slug
   *   ?search=term    - Free-text search
   *   ?sort=newest    - Sort option (price_asc, price_desc, newest, name)
   *
   * Response:
   *   {
   *     "success": true,
   *     "message": "Products retrieved successfully.",
   *     "data": [ { product }, ... ],
   *     "meta": {
   *       "pagination": { currentPage, perPage, totalItems, totalPages, hasNextPage, hasPrevPage }
   *     }
   *   }
   */
  async getProducts(req, res) {
    const { products, pagination } = await productService.getProducts(req.query);

    return sendSuccess(res, {
      message: 'Products retrieved successfully.',
      data: products,
      meta: { pagination },
    });
  },

  /**
   * GET /api/v1/products/featured
   *
   * Fetch featured products for the homepage hero section.
   *
   * Query Parameters:
   *   ?limit=8  - Max featured products (default 8, max 20)
   *
   * Response:
   *   {
   *     "success": true,
   *     "message": "Featured products retrieved successfully.",
   *     "data": [ { product }, ... ]
   *   }
   */
  async getFeaturedProducts(req, res) {
    const limit = parseInt(req.query.limit, 10) || 8;
    const products = await productService.getFeaturedProducts(limit);

    return sendSuccess(res, {
      message: 'Featured products retrieved successfully.',
      data: products,
    });
  },

  /**
   * GET /api/v1/products/:slug
   *
   * Fetch a single product by its URL slug, including all images.
   * This powers the Product Detail Page (PDP).
   *
   * Route Parameters:
   *   :slug  - URL-safe product identifier (e.g., "custom-painted-lighter-01")
   *
   * Response:
   *   {
   *     "success": true,
   *     "message": "Product retrieved successfully.",
   *     "data": { product with images[] }
   *   }
   */
  async getProductBySlug(req, res) {
    const product = await productService.getProductBySlug(req.params.slug);

    return sendSuccess(res, {
      message: 'Product retrieved successfully.',
      data: product,
    });
  },
};

module.exports = productController;
