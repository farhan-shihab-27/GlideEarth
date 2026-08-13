/**
 * @fileoverview Admin Coupon Repository
 */

const { db } = require('../../../config');

const adminCouponRepository = {
  /**
   * Create a new coupon
   * @param {Object} data 
   * @returns {Object}
   */
  async createCoupon(data) {
    const sql = `
      INSERT INTO coupons (
        code, coupon_type, value, min_order_amount, 
        max_discount_amount, usage_limit, is_active, 
        valid_from, valid_until
      ) VALUES (
        $1, $2::coupon_type, $3, $4, $5, $6, COALESCE($7, TRUE), $8, $9
      ) RETURNING *
    `;
    const params = [
      data.code, 
      data.couponType, 
      data.value, 
      data.minOrderAmount || null, 
      data.maxDiscountAmount || null, 
      data.usageLimit || null, 
      data.isActive, 
      data.validFrom || null, 
      data.validUntil || null
    ];
    
    const result = await db.query(sql, params);
    return result.rows[0];
  },

  /**
   * Find coupon by code
   * @param {string} code 
   * @returns {Object|null}
   */
  async findByCode(code) {
    const sql = `
      SELECT * FROM coupons 
      WHERE code = $1 AND deleted_at IS NULL
    `;
    const result = await db.query(sql, [code]);
    return result.rows[0] || null;
  },

  /**
   * Find all coupons
   * @param {Object} options 
   * @returns {Object}
   */
  async findAllCoupons({ limit, offset, isActive }) {
    let sql = 'FROM coupons WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(isActive);
      paramIndex++;
    }

    const countSql = `SELECT COUNT(*) as total ${sql}`;
    const countResult = await db.query(countSql, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataSql = `
      SELECT * ${sql}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    
    const result = await db.query(dataSql, params);
    return { coupons: result.rows, total };
  },

  /**
   * Find coupon by ID
   * @param {string} id 
   * @returns {Object|null}
   */
  async findById(id) {
    const sql = `
      SELECT * FROM coupons 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0] || null;
  },

  /**
   * Update a coupon
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Object}
   */
  async updateCoupon(id, updateData) {
    const fieldMapping = {
      code: 'code',
      couponType: 'coupon_type',
      value: 'value',
      minOrderAmount: 'min_order_amount',
      maxDiscountAmount: 'max_discount_amount',
      usageLimit: 'usage_limit',
      isActive: 'is_active',
      validFrom: 'valid_from',
      validUntil: 'valid_until'
    };

    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (updateData[key] !== undefined) {
        // ENUM fields require explicit PostgreSQL type casts
        const cast = dbField === 'coupon_type' ? '::coupon_type' : '';
        updates.push(`${dbField} = $${paramIndex}${cast}`);
        params.push(updateData[key]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    
    params.push(id);
    const sql = `
      UPDATE coupons 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex} AND deleted_at IS NULL 
      RETURNING *
    `;

    const result = await db.query(sql, params);
    return result.rows[0];
  },

  /**
   * Soft delete a coupon
   * @param {string} id 
   * @returns {Object}
   */
  async softDelete(id) {
    const sql = `
      UPDATE coupons 
      SET deleted_at = NOW(), is_active = FALSE 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id, code
    `;
    const result = await db.query(sql, [id]);
    return result.rows[0];
  }
};

module.exports = adminCouponRepository;
