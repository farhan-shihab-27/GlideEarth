/**
 * Admin Order Routes
 * Express routes for admin order endpoints.
 * @module modules/admin/orders/admin-order.routes
 */

const { Router } = require('express');
const adminOrderController = require('./admin-order.controller');
const asyncHandler = require('../../../utils/asyncHandler');

const router = Router();

// Route to get a paginated list of orders
router.get('/', asyncHandler(adminOrderController.getOrders));

// Route to get a specific order by ID
router.get('/:id', asyncHandler(adminOrderController.getOrderById));

// Route to update order status and details
router.put('/:id/status', asyncHandler(adminOrderController.updateOrderStatus));

module.exports = router;
