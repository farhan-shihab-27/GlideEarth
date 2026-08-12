/**
 * @fileoverview Repository for Category entity.
 * Handles all raw SQL queries against the `categories` table.
 * Uses parameterized queries to prevent SQL injection.
 * Enforces partial index usage for active/non-deleted items.
 */

const { db } = require('../../config');

class CategoryRepository {
  /**
   * Fetch all active, non-deleted categories.
   * Hits the partial index `idx_categories_active`.
   * @returns {Promise<Array<Object>>} List of category records.
   */
  async findAllActive() {
    const sql = `
      SELECT id, name, slug, description, image_url, parent_id, sort_order 
      FROM categories 
      WHERE deleted_at IS NULL AND is_active = TRUE 
      ORDER BY sort_order ASC, name ASC
    `;
    const { rows } = await db.query(sql);
    return rows;
  }

  /**
   * Fetch a single category by its slug.
   * Hits the `idx_categories_slug` partial index.
   * @param {string} slug - The category slug.
   * @returns {Promise<Object|null>} The category record or null if not found.
   */
  async findBySlug(slug) {
    const sql = `
      SELECT id, name, slug, description, image_url, parent_id, sort_order 
      FROM categories 
      WHERE slug = $1 AND deleted_at IS NULL AND is_active = TRUE
    `;
    const { rows } = await db.query(sql, [slug]);
    return rows[0] || null;
  }

  /**
   * Count active products per category for storefront nav badges.
   * @returns {Promise<Array<Object>>} List of category IDs with product_count.
   */
  async countProductsByCategory() {
    const sql = `
      SELECT c.id, COUNT(p.id)::INTEGER AS product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id AND p.deleted_at IS NULL AND p.is_active = TRUE 
      WHERE c.deleted_at IS NULL AND c.is_active = TRUE 
      GROUP BY c.id
    `;
    const { rows } = await db.query(sql);
    return rows;
  }
}

module.exports = new CategoryRepository();
