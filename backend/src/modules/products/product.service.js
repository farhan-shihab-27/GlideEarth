/**
 * ============================================================================
 * GLIDEEARTH — PRODUCT SERVICE (Business Logic Layer)
 * ============================================================================
 * Pure business logic, completely decoupled from HTTP concerns.
 * This layer:
 *   • Validates and sanitizes business rules (not HTTP payloads).
 *   • Orchestrates repository calls.
 *   • Applies default values, computations, and transformations.
 *   • Throws AppErrors for business rule violations.
 *
 * The service knows NOTHING about req, res, or HTTP status codes.
 * It only speaks in domain objects and AppErrors.
 * ============================================================================
 */

const productRepository = require('./product.repository');
const AppError = require('../../utils/AppError');

// ============================================================================
// CONSTANTS
// ============================================================================

/** Maximum products per page — prevents clients from requesting 10,000 rows */
const MAX_PAGE_SIZE = 50;

/** Default products per page */
const DEFAULT_PAGE_SIZE = 12;

/** Allowed sort options — whitelist to prevent SQL injection via sort param */
const ALLOWED_SORT_OPTIONS = ['price_asc', 'price_desc', 'newest', 'name'];

const productService = {
  /**
   * Get a paginated, filterable list of active storefront products.
   *
   * BUSINESS RULES:
   * 1. Page size is clamped to [1, MAX_PAGE_SIZE] — no unbounded queries.
   * 2. Sort option is whitelist-validated — invalid values fall back to default.
   * 3. Search terms are trimmed and length-limited.
   * 4. Returns pagination metadata for the frontend to build page controls.
   *
   * @param {object} queryParams - Raw query parameters from the controller.
   * @param {string} [queryParams.page] - Page number (1-indexed).
   * @param {string} [queryParams.limit] - Items per page.
   * @param {string} [queryParams.category] - Category slug filter.
   * @param {string} [queryParams.search] - Free-text search term.
   * @param {string} [queryParams.sort] - Sort option key.
   * @returns {Promise<{ products: Array, pagination: object }>}
   */
  async getProducts(queryParams = {}) {
    // ── Parse & Sanitize Pagination ──────────────────────────────
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(queryParams.limit, 10) || DEFAULT_PAGE_SIZE)
    );
    const offset = (page - 1) * limit;

    // ── Sanitize Sort ────────────────────────────────────────────
    const sortBy = ALLOWED_SORT_OPTIONS.includes(queryParams.sort)
      ? queryParams.sort
      : null; // null = use repository default (featured first)

    // ── Sanitize Search ──────────────────────────────────────────
    const search = queryParams.search
      ? queryParams.search.trim().substring(0, 100) // Cap at 100 chars
      : null;

    // ── Sanitize Category ────────────────────────────────────────
    const categorySlug = queryParams.category
      ? queryParams.category.trim().toLowerCase()
      : null;

    // ── Execute Repository Query ─────────────────────────────────
    const { products, totalCount } = await productRepository.findAllActive({
      limit,
      offset,
      categorySlug,
      search,
      sortBy,
    });

    // ── Build Pagination Metadata ────────────────────────────────
    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get a single product by its URL slug, including all images.
   * Used for the Product Detail Page (PDP).
   *
   * @param {string} slug - The product's URL-safe identifier.
   * @returns {Promise<object>} The full product object with images.
   * @throws {AppError} 404 if the product doesn't exist or is inactive.
   */
  async getProductBySlug(slug) {
    if (!slug || typeof slug !== 'string') {
      throw AppError.badRequest('Product slug is required.');
    }

    const product = await productRepository.findBySlug(slug.trim().toLowerCase());

    if (!product) {
      throw AppError.notFound(`Product "${slug}" not found.`);
    }

    return product;
  },

  /**
   * Get featured products for the homepage hero/carousel section.
   *
   * @param {number} [limit=8] - Max featured products to return.
   * @returns {Promise<Array>}
   */
  async getFeaturedProducts(limit = 8) {
    const safeLimit = Math.min(Math.max(1, limit), 20);
    return productRepository.findFeatured(safeLimit);
  },
};

module.exports = productService;
