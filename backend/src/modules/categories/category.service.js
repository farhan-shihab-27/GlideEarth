/**
 * @fileoverview Service for Category entity.
 * Contains business logic for categories, mapping flat data to hierarchical structures,
 * and concurrent data fetching.
 */

const categoryRepository = require('./category.repository');
const AppError = require('../../utils/AppError');

class CategoryService {
  /**
   * Builds a nested tree structure from a flat list of categories.
   * @param {Array<Object>} categories - Flat list of categories.
   * @param {Map<number, number>} productCountsMap - Map of category ID to product count.
   * @returns {Array<Object>} Hierarchical category tree.
   * @private
   */
  _buildTree(categories, productCountsMap) {
    const map = new Map();
    const roots = [];

    // Initialize map with enriched categories
    for (const category of categories) {
      map.set(category.id, {
        ...category,
        product_count: productCountsMap.get(category.id) || 0,
        children: [],
      });
    }

    // Build the tree
    for (const category of categories) {
      const node = map.get(category.id);
      if (category.parent_id) {
        const parent = map.get(category.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /**
   * Retrieves all active categories and their product counts,
   * returning them as a nested tree structure.
   * @returns {Promise<Array<Object>>} The category tree.
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
   * Retrieves a single active category by slug.
   * @param {string} slug - The category slug to look up.
   * @returns {Promise<Object>} The category data.
   * @throws {AppError} If category is not found.
   */
  async getCategoryBySlug(slug) {
    if (!slug || typeof slug !== 'string') {
      throw AppError.badRequest('Invalid slug provided.');
    }

    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw AppError.notFound(`Category with slug '${slug}' not found.`);
    }

    return category;
  }
}

module.exports = new CategoryService();
