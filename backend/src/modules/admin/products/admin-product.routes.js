/**
 * @fileoverview Admin Product Routes.
 * Defines the Express router for admin product operations.
 * Authentication is handled by the parent router.
 */

const { Router } = require('express');
const adminProductController = require('./admin-product.controller');
const asyncHandler = require('../../../utils/asyncHandler');
const { uploadProductImages, handleUploadErrors } = require('../../../utils/upload');

const router = Router();

/**
 * POST /
 * Create a new product with optional images.
 */
router.post(
  '/',
  (req, res, next) => {
    uploadProductImages(req, res, (err) => {
      if (err) return handleUploadErrors(err, req, res, next);
      next();
    });
  },
  asyncHandler(adminProductController.createProduct)
);

/**
 * PUT /:id
 * Update an existing product.
 */
router.put('/:id', asyncHandler(adminProductController.updateProduct));

/**
 * DELETE /:id
 * Soft delete a product.
 */
router.delete('/:id', asyncHandler(adminProductController.deleteProduct));

module.exports = router;
