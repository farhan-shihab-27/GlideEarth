const express = require('express');
const couponController = require('./coupon.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

/**
 * @route POST /validate
 * @description Validate a coupon code
 * @access Public
 */
router.post(
  '/validate',
  asyncHandler(couponController.validateCoupon.bind(couponController))
);

module.exports = router;
