/**
 * ============================================================================
 * GLIDEEARTH — PRODUCT REPOSITORY (Data Access Layer)
 * ============================================================================
 * This is the ONLY layer that touches the database. Every query here is
 * hand-written, parameterized raw SQL — no ORM overhead.
 *
 * PERFORMANCE STRATEGY:
 * ─────────────────────
 * Every query in this file is designed to hit the B-Tree and Partial Indexes
 * defined in schema.sql. Key optimizations:
 *
 * 1. `WHERE p.deleted_at IS NULL AND p.is_active = TRUE`
 *    → Hits `idx_products_active_featured` partial index.
 *
 * 2. `WHERE p.slug = $1 AND p.deleted_at IS NULL`
 *    → Hits `idx_products_slug` partial index for O(log n) lookups.
 *
 * 3. LEFT JOIN with `pi.is_primary = TRUE`
 *    → Hits `uq_product_images_primary` partial unique index.
 *
 * 4. All JOINs on foreign keys (category_id, product_id)
 *    → Hit `idx_products_category_id`, `idx_product_images_product_id`.
 * ============================================================================
 */

const { db } = require('../../config');

const productRepository = {
  /**
   * Fetch all active products for the storefront with their primary image
   * and category name.
   *
   * QUERY PLAN:
   * - Scans `idx_products_active_featured` (partial index on active, non-deleted)
   * - Joins categories via `idx_products_category_id`
   * - Joins primary image via `uq_product_images_primary` (partial unique index)
   * - Sorts by featured first, then sort_order, then newest
   *
   * @param {object} options
   * @param {number} options.limit  - Max products to return.
   * @param {number} options.offset - Offset for pagination.
   * @param {string} [options.categorySlug] - Optional category filter.
   * @param {string} [options.search] - Optional search term (trigram).
   * @param {string} [options.sortBy] - Sort field ('price_asc', 'price_desc', 'newest', 'name').
   * @returns {Promise<{ products: Array, totalCount: number }>}
   */
  async findAllActive({ limit, offset, categorySlug, search, sortBy }) {
    // ── Dynamic WHERE clause construction ──────────────────────────
    const conditions = [
      'p.deleted_at IS NULL',
      'p.is_active = TRUE',
    ];
    const params = [];
    let paramIndex = 1;

    // Category filter
    if (categorySlug) {
      conditions.push(`c.slug = $${paramIndex}`);
      params.push(categorySlug);
      paramIndex++;
    }

    // Search filter (uses GIN trigram index: idx_products_name_trgm)
    if (search) {
      conditions.push(`p.name ILIKE $${paramIndex}`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // ── Dynamic ORDER BY ──────────────────────────────────────────
    const sortMap = {
      price_asc: 'effective_price ASC',
      price_desc: 'effective_price DESC',
      newest: 'p.created_at DESC',
      name: 'p.name ASC',
    };
    const orderBy = sortMap[sortBy] || 'p.is_featured DESC, p.sort_order ASC, p.created_at DESC';

    // ── COUNT query (for pagination metadata) ─────────────────────
    const countQuery = `
      SELECT COUNT(*)::INTEGER AS total_count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE ${whereClause}
    `;

    // ── DATA query ────────────────────────────────────────────────
    const dataQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.short_description,
        p.regular_price,
        p.discount_price,
        COALESCE(p.discount_price, p.regular_price) AS effective_price,
        p.stock_quantity,
        p.is_featured,
        c.name    AS category_name,
        c.slug    AS category_slug,
        pi.image_url   AS primary_image_url,
        pi.alt_text    AS primary_image_alt
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = TRUE
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Add LIMIT and OFFSET as the final parameters
    const dataParams = [...params, limit, offset];

    // ── Execute both queries concurrently ─────────────────────────
    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, params),
      db.query(dataQuery, dataParams),
    ]);

    return {
      products: dataResult.rows,
      totalCount: countResult.rows[0].total_count,
    };
  },

  /**
   * Fetch a single product by slug, including ALL images and category info.
   * Used for the Product Detail Page (PDP) — the second step in the
   * ad-click → browse → PDP → checkout funnel.
   *
   * QUERY PLAN:
   * - Hits `idx_products_slug` (partial B-Tree index) for O(log n) lookup.
   * - Joins all images sorted by sort_order.
   *
   * @param {string} slug - The URL-safe product identifier.
   * @returns {Promise<object|null>} Product with images, or null if not found.
   */
  async findBySlug(slug) {
    // First: fetch the product with its category
    const productQuery = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.short_description,
        p.description,
        p.regular_price,
        p.discount_price,
        COALESCE(p.discount_price, p.regular_price) AS effective_price,
        p.stock_quantity,
        p.weight_grams,
        p.is_featured,
        p.meta_title,
        p.meta_description,
        p.created_at,
        c.id      AS category_id,
        c.name    AS category_name,
        c.slug    AS category_slug
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      WHERE p.slug = $1
        AND p.deleted_at IS NULL
        AND p.is_active = TRUE
    `;

    const { rows: [product] } = await db.query(productQuery, [slug]);

    if (!product) return null;

    // Second: fetch all images for this product
    const imagesQuery = `
      SELECT
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, sort_order ASC
    `;

    const { rows: images } = await db.query(imagesQuery, [product.id]);

    return { ...product, images };
  },

  /**
   * Fetch products marked as featured for the homepage hero section.
   *
   * @param {number} limit - Max featured products to return.
   * @returns {Promise<Array>}
   */
  async findFeatured(limit = 8) {
    const query = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.regular_price,
        p.discount_price,
        COALESCE(p.discount_price, p.regular_price) AS effective_price,
        c.name    AS category_name,
        c.slug    AS category_slug,
        pi.image_url   AS primary_image_url,
        pi.alt_text    AS primary_image_alt
      FROM products p
      JOIN categories c
        ON c.id = p.category_id
      LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = TRUE
      WHERE p.deleted_at IS NULL
        AND p.is_active = TRUE
        AND p.is_featured = TRUE
      ORDER BY p.sort_order ASC, p.created_at DESC
      LIMIT $1
    `;

    const { rows } = await db.query(query, [limit]);
    return rows;
  },
};

module.exports = productRepository;
