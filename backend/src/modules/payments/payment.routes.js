/**
 * @fileoverview Payment routes for IPN handling
 */
const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const asyncHandler = require('../../utils/asyncHandler');

// POST /ipn
// Public endpoint intentionally (payment gateways call this, no auth)
router.post('/ipn', asyncHandler(paymentController.handleIpn.bind(paymentController)));

module.exports = router;
