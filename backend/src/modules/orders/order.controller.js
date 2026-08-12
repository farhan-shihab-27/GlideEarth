const { sendSuccess } = require('../../utils/apiResponse');
const orderService = require('./order.service');

/**
 * Order Controller
 * 
 * Handles incoming HTTP requests for the checkout system.
 * Keeps controllers "thin" by immediately delegating to the OrderService.
 * Responses are formatted via the standard API response envelope.
 */
class OrderController {
  /**
   * Handles checkout processing and order placement.
   * 
   * @param {Object} req - Express Request object
   * @param {Object} res - Express Response object
   * 
   * @description
   * Extracts the full structured payload from `req.body` and routes it to
   * the transactional `checkout` service method. Returns a 201 Created on success.
   */
  async checkout(req, res) {
    const checkoutData = req.body;
    
    const result = await orderService.checkout(checkoutData);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Order placed successfully.',
      data: result
    });
  }

  /**
   * Retrieves full order details for public confirmation or tracking pages.
   * 
   * @param {Object} req - Express Request object
   * @param {Object} res - Express Response object
   */
  async getOrderByNumber(req, res) {
    const { orderNumber } = req.params;

    const order = await orderService.getOrderByNumber(orderNumber);

    return sendSuccess(res, {
      message: 'Order retrieved successfully.',
      data: order
    });
  }
}

module.exports = new OrderController();
