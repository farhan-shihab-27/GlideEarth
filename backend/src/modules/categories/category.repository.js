/**
 * @fileoverview Repository for Category entity.
 * Handles all raw SQL queries against the `categories` table.
 * Uses parameterized queries to prevent SQL injection.
 * Enforces partial index usage for active/non-deleted items.
 */

const { db } = require('../../config');

class CategoryRepository {
  /**
   * Fetch all active, non-deleted categories (flat list, all levels).
   * The service layer is responsible for assembling the tree.
   * Hits the partial index `idx_categories_active`.
   * @returns {Promise<Array<Object>>} Flat list of all category records.
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
   * Fetch all active direct children of a given parent category ID.
   * Used by the category page to build the sub-category grid.
   * @param {string} parentId - The UUID of the parent category.
   * @returns {Promise<Array<Object>>} List of child category records.
   */
  async findChildrenByParentId(parentId) {
    const sql = `
      SELECT id, name, slug, description, image_url, parent_id, sort_order 
      FROM categories 
      WHERE parent_id = $1 AND deleted_at IS NULL AND is_active = TRUE 
      ORDER BY sort_order ASC, name ASC
    `;
    const { rows } = await db.query(sql, [parentId]);
    return rows;
  }

  /**
   * Count active products per category for storefront nav badges.
   * Counts products whose direct category_id matches — i.e., products
   * assigned to sub-categories contribute to those sub-categories' counts.
   * @returns {Promise<Array<Object>>} List of { id, product_count } rows.
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
