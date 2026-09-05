/**
 * @fileoverview Service for Category entity.
 * Contains business logic for categories: tree-building, concurrent fetching,
 * and enriching single-category lookups with their children and product counts.
 */

const categoryRepository = require('./category.repository');
const AppError = require('../../utils/AppError');

class CategoryService {
  /**
   * Builds a nested tree structure from a flat list of categories.
   * Root nodes (parent_id = null) become the array; children are nested.
   *
   * @param {Array<Object>} categories - Flat list of all category records.
   * @param {Map<string, number>} productCountsMap - Map of category ID → product count.
   * @returns {Array<Object>} Hierarchical category tree (roots with children[]).
   * @private
   */
  _buildTree(categories, productCountsMap) {
    const map = new Map();
    const roots = [];

    // Pass 1: Initialize every node in the map with enriched data
    for (const category of categories) {
      map.set(category.id, {
        ...category,
        product_count: productCountsMap.get(category.id) || 0,
        children: [],
      });
    }

    // Pass 2: Wire parent ↔ child relationships
    for (const category of categories) {
      const node = map.get(category.id);
      if (category.parent_id) {
        const parent = map.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        // No parent_id → this is a root category
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Retrieves all active categories and returns them as a nested tree.
   * Root categories (parent_id = null) are at the top level; their
   * children (sub-categories) are nested in the `children` array.
   *
   * Uses concurrent DB queries via Promise.all for minimal latency.
   *
   * @returns {Promise<Array<Object>>} The full category tree.
   */
  async getCategories() {
    const [categories, productCounts] = await Promise.all([
      categoryRepository.findAllActive(),
      categoryRepository.countProductsByCategory(),
    ]);

    const productCountsMap = new Map();
    for (const row of productCounts) {
      productCountsMap.set(row.id, row.product_count);
    }

    return this._buildTree(categories, productCountsMap);
  }

  /**
   * Retrieves a single active category by slug, enriched with:
   *   - Its direct children (sub-categories) with product counts.
   *   - Its own product_count.
   *
   * This powers the `/category/[slug]` page:
   *   - If category is a ROOT (parent_id = null) → children array will be
   *     populated with sub-categories to render as the sub-category grid.
   *   - If category is a LEAF (parent_id set, no children) → children will
   *     be empty, and the page shows products directly.
   *
   * @param {string} slug - The category slug to look up.
   * @returns {Promise<Object>} The enriched category data.
   * @throws {AppError} 400 if slug is invalid; 404 if not found.
   */
  async getCategoryBySlug(slug) {
    if (!slug || typeof slug !== 'string') {
      throw AppError.badRequest('Invalid slug provided.');
    }

    // Fetch the category and all product counts concurrently
    const [category, productCounts] = await Promise.all([
      categoryRepository.findBySlug(slug),
      categoryRepository.countProductsByCategory(),
    ]);

    if (!category) {
      throw AppError.notFound(`Category with slug '${slug}' not found.`);
    }

    // Build a product count lookup map
    const productCountsMap = new Map();
    for (const row of productCounts) {
      productCountsMap.set(row.id, row.product_count);
    }

    // Fetch direct children of this category (empty array if it's a leaf)
    const rawChildren = await categoryRepository.findChildrenByParentId(category.id);

    // Enrich children with product counts
    const children = rawChildren.map((child) => ({
      ...child,
      product_count: productCountsMap.get(child.id) || 0,
      children: [], // We only go 2 levels deep by design
    }));

    return {
      ...category,
      product_count: productCountsMap.get(category.id) || 0,
      children,
    };
  }
}

module.exports = new CategoryService();
