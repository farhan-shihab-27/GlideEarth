const couponService = require('./coupon.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * @fileoverview Coupon Controller for storefront
 */
class CouponController {
  /**
   * Validate a coupon code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async validateCoupon(req, res) {
    const { code, orderSubtotal } = req.body;
    
    const result = await couponService.validateCoupon(code, orderSubtotal);
    
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Coupon is valid.',
      data: result
    });
  }
}

module.exports = new CouponController();
