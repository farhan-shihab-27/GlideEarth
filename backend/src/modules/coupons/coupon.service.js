const couponRepository = require('./coupon.repository');
const AppError = require('../../utils/AppError');

/**
 * @fileoverview Coupon Service for storefront
 */
class CouponService {
  /**
   * Validate a coupon code and calculate discount
   * @param {string} code - Coupon code
   * @param {number} [orderSubtotal] - Order subtotal
   * @returns {Promise<Object>} Validation result with discount info
   * @throws {AppError} If coupon is invalid or conditions not met
   */
  async validateCoupon(code, orderSubtotal) {
    if (!code) {
      throw AppError.badRequest('Coupon code is required.');
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await couponRepository.findActiveByCode(cleanCode);

    if (!coupon) {
      throw AppError.notFound('Invalid or expired coupon code.');
    }

    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      throw AppError.badRequest('Invalid or expired coupon code.');
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      throw AppError.badRequest('Invalid or expired coupon code.');
    }

    if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
      throw AppError.badRequest('Coupon usage limit reached.');
    }

    if (orderSubtotal !== undefined && orderSubtotal !== null) {
      const subtotalNum = Number(orderSubtotal);
      if (coupon.min_order_amount && subtotalNum < Number(coupon.min_order_amount)) {
        throw AppError.badRequest(`Minimum order amount of ${coupon.min_order_amount} is required to use this coupon.`);
      }
    }

    let calculatedDiscount = null;

    if (orderSubtotal !== undefined && orderSubtotal !== null) {
      const subtotalNum = Number(orderSubtotal);
      const couponValue = Number(coupon.value);

      if (coupon.coupon_type === 'percentage') {
        calculatedDiscount = subtotalNum * (couponValue / 100);
        if (coupon.max_discount_amount) {
          const maxDiscount = Number(coupon.max_discount_amount);
          if (calculatedDiscount > maxDiscount) {
            calculatedDiscount = maxDiscount;
          }
        }
      } else if (coupon.coupon_type === 'fixed_amount') {
        calculatedDiscount = couponValue;
        if (calculatedDiscount > subtotalNum) {
          calculatedDiscount = subtotalNum;
        }
      }
    }

    return {
      couponId: coupon.id,
      code: coupon.code,
      couponType: coupon.coupon_type,
      discountValue: Number(coupon.value),
      calculatedDiscount,
      minOrderAmount: coupon.min_order_amount ? Number(coupon.min_order_amount) : null,
      maxDiscountAmount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null
    };
  }
}

module.exports = new CouponService();
