const { db } = require('../../config');

/**
 * @fileoverview Coupon Repository for storefront
 */
class CouponRepository {
  /**
   * Find an active coupon by code
   * @param {string} code - The coupon code
   * @returns {Promise<Object|null>} The coupon object or null
   */
  async findActiveByCode(code) {
    const query = `
      SELECT * 
      FROM coupons 
      WHERE UPPER(code) = $1 
        AND deleted_at IS NULL 
        AND is_active = TRUE
    `;
    const result = await db.query(query, [code]);
    return result.rows[0] || null;
  }

  /**
   * Increment coupon usage count
   * @param {Object} client - Transaction client
   * @param {string} couponId - Coupon ID
   * @returns {Promise<void>}
   */
  async incrementUsage(client, couponId) {
    const query = `
      UPDATE coupons 
      SET times_used = times_used + 1 
      WHERE id = $1
    `;
    await client.query(query, [couponId]);
  }
}

module.exports = new CouponRepository();
