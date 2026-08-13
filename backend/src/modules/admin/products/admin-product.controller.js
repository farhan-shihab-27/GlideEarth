/**
 * @fileoverview Admin Product Controller.
 * Handles HTTP requests, extracts parameters, and formulates responses.
 */

const adminProductService = require('./admin-product.service');
const { sendSuccess } = require('../../../utils/apiResponse');

/**
 * Admin Product Controller methods.
 * @namespace adminProductController
 */
const adminProductController = {
  /**
   * Handles product creation requests.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createProduct(req, res) {
    const productData = req.body;
    const files = req.files;

    const result = await adminProductService.createProduct(productData, files);
    
    sendSuccess(res, {
      statusCode: 201,
      message: 'Product created successfully.',
      data: result
    });
  },

  /**
   * Handles product update requests.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updateProduct(req, res) {
    const productId = req.params.id;
    const updateData = req.body;

    const result = await adminProductService.updateProduct(productId, updateData);

    sendSuccess(res, {
      message: 'Product updated successfully.',
      data: result
    });
  },

  /**
   * Handles product deletion requests.
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deleteProduct(req, res) {
    const productId = req.params.id;

    const result = await adminProductService.deleteProduct(productId);

    sendSuccess(res, {
      message: 'Product deleted successfully.',
      data: result
    });
  }
};

module.exports = adminProductController;
