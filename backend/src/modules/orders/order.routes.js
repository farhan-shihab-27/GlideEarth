const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const orderController = require('./order.controller');

const router = express.Router();

/**
 * @route   POST /api/v1/orders/checkout
 * @desc    Process cart checkout, handle inventory locking, and place an order
 * @access  Public (Guest Checkout Allowed)
 */
router.post('/checkout', asyncHandler(orderController.checkout));

/**
 * @route   GET /api/v1/orders/:orderNumber
 * @desc    Retrieve order details for confirmation page using order number
 * @access  Public (Order tracking via specific secure hash/number)
 */
router.get('/:orderNumber', asyncHandler(orderController.getOrderByNumber));

module.exports = router;
