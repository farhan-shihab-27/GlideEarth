const express = require('express');
const router = express.Router();
const couponController = require('./admin-coupon.controller');
const asyncHandler = require('../../../utils/asyncHandler');

router.post('/', asyncHandler(couponController.createCoupon));
router.get('/', asyncHandler(couponController.getCoupons));
router.get('/:id', asyncHandler(couponController.getCouponById));
router.put('/:id', asyncHandler(couponController.updateCoupon));
router.delete('/:id', asyncHandler(couponController.deleteCoupon));

module.exports = router;
