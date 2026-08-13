const express = require('express');
const router = express.Router();
const statsController = require('./stats.controller');
const asyncHandler = require('../../../utils/asyncHandler');

/**
 * @fileoverview Routes for admin dashboard statistics
 */

/**
 * @route GET /
 * @description Get dashboard statistics
 */
router.get('/', asyncHandler(statsController.getDashboardStats));

module.exports = router;
