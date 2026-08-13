/**
 * @fileoverview Admin Coupon Service
 */

const couponRepository = require('./admin-coupon.repository');
const AppError = require('../../../utils/AppError');

const adminCouponService = {
  /**
   * Create a new coupon
   * @param {Object} data 
   * @returns {Object}
   */
  async createCoupon(data) {
    const { code, couponType, value, minOrderAmount, maxDiscountAmount, usageLimit, isActive, validFrom, validUntil } = data;

    if (!code || !couponType || value === undefined) {
      throw AppError.badRequest('Code, couponType, and value are required');
    }

    const upperCode = code.toUpperCase();
    
    const existing = await couponRepository.findByCode(upperCode);
    if (existing) {
      throw AppError.conflict('Coupon code already exists');
    }

    return await couponRepository.createCoupon({
      code: upperCode,
      couponType,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      isActive,
      validFrom,
      validUntil
    });
  },

  /**
   * List all coupons with pagination
   * @param {Object} query 
   * @returns {Object}
   */
  async getCoupons(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    let isActive;
    if (query.active !== undefined) {
      isActive = query.active === 'true';
    }

    const { coupons, total } = await couponRepository.findAllCoupons({ limit, offset, isActive });

    return {
      data: coupons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Get single coupon by ID
   * @param {string} id 
   * @returns {Object}
   */
  async getCouponById(id) {
    if (!id) throw AppError.badRequest('Coupon ID is required');
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw AppError.notFound('Coupon not found');
    }
    return coupon;
  },

  /**
   * Update a coupon
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object}
   */
  async updateCoupon(id, updateData) {
    if (!id) throw AppError.badRequest('Coupon ID is required');

    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Coupon not found');
    }
    
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      if (updateData.code !== existing.code) {
        const dupCode = await couponRepository.findByCode(updateData.code);
        if (dupCode) {
          throw AppError.conflict('Coupon code already exists');
        }
      }
    }

    return await couponRepository.updateCoupon(id, updateData);
  },

  /**
   * Soft delete a coupon
   * @param {string} id 
   * @returns {Object}
   */
  async deleteCoupon(id) {
    if (!id) throw AppError.badRequest('Coupon ID is required');

    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Coupon not found');
    }

    return await couponRepository.softDelete(id);
  }
};

module.exports = adminCouponService;
