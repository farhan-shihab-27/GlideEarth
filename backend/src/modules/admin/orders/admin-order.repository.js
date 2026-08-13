/**
 * Admin Order Repository
 * Handles all database operations for admin order management.
 * @module modules/admin/orders/admin-order.repository
 */

const { db } = require('../../../config');

const adminOrderRepository = {
  /**
   * Fetch paginated orders with optional filters.
   * @param {Object} params - Pagination and filter parameters.
   * @param {number} params.limit - Number of records to return.
   * @param {number} params.offset - Number of records to skip.
   * @param {string} [params.status] - Filter by order status.
   * @param {string} [params.paymentStatus] - Filter by payment status.
   * @param {string} [params.paymentMethod] - Filter by payment method.
   * @returns {Promise<{orders: Array, totalCount: number}>} Resolves to orders array and total count.
   */
  async findAllOrders({ limit, offset, status, paymentStatus, paymentMethod }) {
    let whereClause = '';
    const params = [];
    let paramIndex = 1;

    const conditions = [];

    if (status) {
      conditions.push(`o.order_status = $${paramIndex}::order_status`);
      params.push(status);
      paramIndex++;
    }

    if (paymentStatus) {
      conditions.push(`o.payment_status = $${paramIndex}::payment_status`);
      params.push(paymentStatus);
      paramIndex++;
    }

    if (paymentMethod) {
      conditions.push(`o.payment_method = $${paramIndex}::payment_method`);
      params.push(paymentMethod);
      paramIndex++;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const countQuery = `SELECT COUNT(*) AS total FROM orders o ${whereClause}`;
    
    const dataQuery = `
      SELECT 
        o.id, o.order_number, o.total_amount, o.subtotal, o.discount_amount,
        o.shipping_charge, o.payment_method, o.payment_status, o.order_status,
        o.shipping_name, o.shipping_phone, o.shipping_city,
        o.tracking_number, o.placed_at, o.confirmed_at, o.shipped_at, o.delivered_at, o.cancelled_at,
        c.full_name AS customer_name, c.phone_number AS customer_phone, c.email AS customer_email
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ${whereClause}
      ORDER BY o.placed_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];

    const [countResult, dataResult] = await Promise.all([
      db.query(countQuery, params),
      db.query(dataQuery, dataParams)
    ]);

    return {
      orders: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].total, 10)
    };
  },

  /**
   * Fetch a single order by ID including customer info and order items.
   * @param {string|number} orderId - The ID of the order to fetch.
   * @returns {Promise<Object|null>} Resolves to the order object or null if not found.
   */
  async findOrderById(orderId) {
    const orderQuery = `
      SELECT 
        o.id, o.order_number, o.total_amount, o.subtotal, o.discount_amount,
        o.shipping_charge, o.payment_method, o.payment_status, o.order_status,
        o.shipping_name, o.shipping_phone, o.shipping_city,
        o.shipping_address_line_1, o.shipping_address_line_2,
        o.shipping_state_province, o.shipping_postal_code, o.shipping_country,
        o.tracking_number, o.admin_notes, o.customer_notes,
        o.placed_at, o.confirmed_at, o.shipped_at, 
        o.delivered_at, o.cancelled_at, o.updated_at,
        c.full_name AS customer_name, c.phone_number AS customer_phone, c.email AS customer_email
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `;

    const itemsQuery = `
      SELECT 
        oi.id, oi.product_id, oi.product_name_snapshot, oi.product_sku_snapshot,
        oi.quantity, oi.unit_price_at_purchase, oi.subtotal
      FROM order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC
    `;

    const [orderResult, itemsResult] = await Promise.all([
      db.query(orderQuery, [orderId]),
      db.query(itemsQuery, [orderId])
    ]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    return order;
  },

  /**
   * Update order status and tracking info.
   * @param {string|number} orderId - The ID of the order to update.
   * @param {Object} updateData - Data to update.
   * @param {string} [updateData.orderStatus] - New order status.
   * @param {string} [updateData.trackingNumber] - New tracking number.
   * @param {string} [updateData.adminNotes] - Admin notes.
   * @returns {Promise<Object|null>} Resolves to the updated order or null if not found.
   */
  async updateOrderStatus(orderId, { orderStatus, trackingNumber, adminNotes }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;
    let timestampClause = '';

    if (orderStatus !== undefined) {
      updates.push(`order_status = $${paramIndex}::order_status`);
      params.push(orderStatus);
      paramIndex++;

      switch (orderStatus) {
        case 'confirmed':
          timestampClause = ', confirmed_at = NOW()';
          break;
        case 'shipped':
          timestampClause = ', shipped_at = NOW()';
          break;
        case 'delivered':
          timestampClause = ', delivered_at = NOW()';
          break;
        case 'cancelled':
          timestampClause = ', cancelled_at = NOW()';
          break;
      }
    }

    if (trackingNumber !== undefined) {
      updates.push(`tracking_number = $${paramIndex}`);
      params.push(trackingNumber);
      paramIndex++;
    }

    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramIndex}`);
      params.push(adminNotes);
      paramIndex++;
    }

    if (updates.length === 0) {
      return null; // Nothing to update
    }

    updates.push(`updated_at = NOW()`);
    
    const query = `
      UPDATE orders 
      SET ${updates.join(', ')}${timestampClause}
      WHERE id = $${paramIndex}
      RETURNING id, order_number, order_status, payment_status, tracking_number
    `;
    params.push(orderId);

    const result = await db.query(query, params);
    
    return result.rows.length ? result.rows[0] : null;
  }
};

module.exports = adminOrderRepository;
