/**
 * @fileoverview Controller for Category entity.
 * Handles HTTP requests, extracting parameters, calling the service,
 * and formatting the response using the standard envelope.
 */

const categoryService = require('./category.service');
const { sendSuccess } = require('../../utils/apiResponse');

class CategoryController {
  /**
   * Handle GET request for all categories.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async getCategories(req, res) {
    const tree = await categoryService.getCategories();
    return sendSuccess(res, {
      message: 'Categories retrieved successfully.',
      data: tree,
    });
  }

  /**
   * Handle GET request for a single category by slug.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   * @returns {Promise<void>}
   */
  async getCategoryBySlug(req, res) {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    return sendSuccess(res, {
      message: 'Category retrieved successfully.',
      data: category,
    });
  }
}

module.exports = new CategoryController();
