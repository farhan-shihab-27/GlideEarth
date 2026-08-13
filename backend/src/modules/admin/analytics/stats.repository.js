const { db } = require('../../../config');

/**
 * @fileoverview Repository for admin dashboard statistics
 */

const statsRepository = {
  /**
   * Gets total revenue from paid or delivered orders
   * @returns {Promise<number>} Total revenue amount
   */
  getTotalRevenue: async () => {
    const sql = `
      SELECT COALESCE(SUM(total_amount), 0)::NUMERIC(12,2) AS total_revenue
      FROM orders
      WHERE payment_status = 'paid' OR order_status = 'delivered'
    `;
    const result = await db.query(sql);
    return parseFloat(result.rows[0].total_revenue);
  },

  /**
   * Gets order statistics counts
   * @returns {Promise<Object>} Order stats object
   */
  getOrderStats: async () => {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE order_status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE order_status = 'confirmed') AS confirmed_count,
        COUNT(*) FILTER (WHERE order_status = 'processing') AS processing_count,
        COUNT(*) FILTER (WHERE order_status = 'shipped') AS shipped_count,
        COUNT(*) FILTER (WHERE order_status = 'delivered') AS delivered_count,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') AS cancelled_count,
        COUNT(*) AS total_orders
      FROM orders
    `;
    const result = await db.query(sql);
    const row = result.rows[0];
    return {
      pending_count: parseInt(row.pending_count, 10) || 0,
      confirmed_count: parseInt(row.confirmed_count, 10) || 0,
      processing_count: parseInt(row.processing_count, 10) || 0,
      shipped_count: parseInt(row.shipped_count, 10) || 0,
      delivered_count: parseInt(row.delivered_count, 10) || 0,
      cancelled_count: parseInt(row.cancelled_count, 10) || 0,
      total_orders: parseInt(row.total_orders, 10) || 0
    };
  },

  /**
   * Gets products with low stock
   * @returns {Promise<Array>} List of low stock products
   */
  getLowStockProducts: async () => {
    const sql = `
      SELECT id, name, sku, stock_quantity, low_stock_threshold
      FROM products
      WHERE stock_quantity <= low_stock_threshold
        AND deleted_at IS NULL AND is_active = TRUE
      ORDER BY stock_quantity ASC
      LIMIT 20
    `;
    const result = await db.query(sql);
    return result.rows;
  },

  /**
   * Gets recent orders
   * @returns {Promise<Array>} List of recent orders
   */
  getRecentOrders: async () => {
    const sql = `
      SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
             o.payment_method, o.placed_at,
             c.full_name AS customer_name, c.phone_number AS customer_phone
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.placed_at DESC
      LIMIT 5
    `;
    const result = await db.query(sql);
    return result.rows;
  }
};

module.exports = statsRepository;
