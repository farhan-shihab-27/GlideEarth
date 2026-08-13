/**
 * Admin Order Controller
 * Express controllers for admin order endpoints.
 * @module modules/admin/orders/admin-order.controller
 */

const adminOrderService = require('./admin-order.service');
const { sendSuccess } = require('../../../utils/apiResponse');

const adminOrderController = {
  /**
   * Get all orders with pagination and filters.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async getOrders(req, res) {
    const { orders, pagination } = await adminOrderService.getOrders(req.query);
    return sendSuccess(res, {
      message: 'Orders retrieved successfully.',
      data: orders,
      meta: { pagination }
    });
  },

  /**
   * Get order by ID.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async getOrderById(req, res) {
    const orderId = req.params.id;
    const order = await adminOrderService.getOrderById(orderId);
    return sendSuccess(res, {
      message: 'Order retrieved successfully.',
      data: order
    });
  },

  /**
   * Update order status.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  async updateOrderStatus(req, res) {
    const orderId = req.params.id;
    const { orderStatus, trackingNumber, adminNotes } = req.body;
    
    const updatedOrder = await adminOrderService.updateOrderStatus(orderId, {
      orderStatus,
      trackingNumber,
      adminNotes
    });

    return sendSuccess(res, {
      message: 'Order status updated successfully.',
      data: updatedOrder
    });
  }
};

module.exports = adminOrderController;
