/**
 * @fileoverview Admin Product Service.
 * Handles business logic, validation, and orchestrates repository calls.
 */

const { db } = require('../../../config');
const AppError = require('../../../utils/AppError');
const adminProductRepository = require('./admin-product.repository');
const { saveFile, deleteFile } = require('../../../utils/upload');

/**
 * Admin Product Service methods.
 * @namespace adminProductService
 */
const adminProductService = {
  /**
   * Creates a new product with optional images.
   * @param {object} productData - The data for the new product.
   * @param {Array<object>} files - Uploaded image files (multer).
   * @returns {Promise<object>} The created product and images.
   */
  async createProduct(productData, files) {
    const { name, categoryId, regularPrice, sku } = productData;

    if (!name || !categoryId || !regularPrice || !sku) {
      throw AppError.badRequest('Missing required fields: name, categoryId, regularPrice, sku.');
    }

    if (!productData.slug) {
      productData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    return await db.transaction(async (client) => {
      const product = await adminProductRepository.createProduct(client, productData);
      let images = [];

      if (files && files.length > 0) {
        const imageObjects = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const savedUrl = await saveFile(file.buffer, file.originalname);
          imageObjects.push({
            imageUrl: savedUrl,
            altText: `${product.name} - Image ${i + 1}`,
            isPrimary: i === 0,
            sortOrder: i
          });
        }
        images = await adminProductRepository.insertProductImages(client, product.id, imageObjects);
      }

      return { ...product, images };
    });
  },

  /**
   * Updates an existing product.
   * @param {number} productId - The product ID.
   * @param {object} updateData - Data to update.
   * @returns {Promise<object>} The updated product.
   */
  async updateProduct(productId, updateData) {
    if (!productId) {
      throw AppError.badRequest('Product ID is required.');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw AppError.badRequest('At least one field must be provided for update.');
    }

    const existingProduct = await adminProductRepository.findProductById(productId);
    if (!existingProduct) {
      throw AppError.notFound('Product not found.');
    }

    return await adminProductRepository.updateProduct(productId, updateData);
  },

  /**
   * Soft deletes a product.
   * @param {number} productId - The product ID.
   * @returns {Promise<object>} Information about the deleted product.
   */
  async deleteProduct(productId) {
    if (!productId) {
      throw AppError.badRequest('Product ID is required.');
    }

    const deletedProduct = await adminProductRepository.softDeleteProduct(productId);
    if (!deletedProduct) {
      throw AppError.notFound('Product not found or already deleted.');
    }

    return deletedProduct;
  }
};

module.exports = adminProductService;
