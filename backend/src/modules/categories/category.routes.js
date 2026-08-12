/**
 * @fileoverview Routes for Category entity.
 * Maps HTTP endpoints to controller methods, wrapped with asyncHandler
 * to automatically catch and forward errors to the error middleware.
 */

const express = require('express');
const categoryController = require('./category.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// GET /categories
router.get('/', asyncHandler(categoryController.getCategories.bind(categoryController)));

// GET /categories/:slug
router.get('/:slug', asyncHandler(categoryController.getCategoryBySlug.bind(categoryController)));

module.exports = router;
