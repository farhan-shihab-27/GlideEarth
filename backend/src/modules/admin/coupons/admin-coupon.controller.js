/**
 * @fileoverview Admin Coupon Controller
 */

const couponService = require('./admin-coupon.service');
const { sendSuccess } = require('../../../utils/apiResponse');

const adminCouponController = {
  /**
   * Create a new coupon
   * @param {Object} req 
   * @param {Object} res 
   */
  async createCoupon(req, res) {
    const coupon = await couponService.createCoupon(req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Coupon created successfully',
      data: coupon
    });
  },

  /**
   * List all coupons
   * @param {Object} req 
   * @param {Object} res 
   */
  async getCoupons(req, res) {
    const { page, limit, active } = req.query;
    const result = await couponService.getCoupons({ page, limit, active });
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Coupons retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  },

  /**
   * Get single coupon by ID
   * @param {Object} req 
   * @param {Object} res 
   */
  async getCouponById(req, res) {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Coupon retrieved successfully',
      data: coupon
    });
  },

  /**
   * Update coupon
   * @param {Object} req 
   * @param {Object} res 
   */
  async updateCoupon(req, res) {
    const { id } = req.params;
    const coupon = await couponService.updateCoupon(id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Coupon updated successfully',
      data: coupon
    });
  },

  /**
   * Soft delete coupon
   * @param {Object} req 
   * @param {Object} res 
   */
  async deleteCoupon(req, res) {
    const { id } = req.params;
    const result = await couponService.deleteCoupon(id);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Coupon deleted successfully',
      data: result
    });
  }
};

module.exports = adminCouponController;
