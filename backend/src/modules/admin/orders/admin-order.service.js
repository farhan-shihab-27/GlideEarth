/**
 * ============================================================================
 * GLIDEEARTH — ADMIN ORDER SERVICE (Business Logic Layer)
 * ============================================================================
 * Implements business rules for administrative order management:
 *   • Paginated order listing with multi-filter support
 *   • Single order detail retrieval
 *   • Order status lifecycle transitions with state machine validation
 *
 * STATE MACHINE RULES:
 * ────────────────────
 * Orders in 'delivered' or 'cancelled' terminal states cannot be
 * transitioned further — this prevents accidental reopening of
 * finalized orders.
 * ============================================================================
 */

const AppError = require('../../../utils/AppError');
const adminOrderRepository = require('./admin-order.repository');

// ── Whitelisted enum values (must mirror PostgreSQL ENUM definitions) ────────
const ALLOWED_ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'returned'
];

const ALLOWED_PAYMENT_STATUSES = [
  'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
];

const ALLOWED_PAYMENT_METHODS = ['cod', 'online'];

const adminOrderService = {
  /**
   * Retrieve a paginated list of orders with optional filtering.
   *
   * @param {Object} queryParams - Raw query parameters from the controller.
   * @param {string} [queryParams.page]          - Page number (1-indexed).
   * @param {string} [queryParams.limit]         - Items per page (max 100).
   * @param {string} [queryParams.status]        - Filter by order_status enum.
   * @param {string} [queryParams.paymentStatus] - Filter by payment_status enum.
   * @param {string} [queryParams.paymentMethod] - Filter by payment_method enum.
   * @returns {Promise<{ orders: Array, pagination: Object }>}
   */
  async getOrders(queryParams) {
    let { page = 1, limit = 20, status, paymentStatus, paymentMethod } = queryParams;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    // ── Validate filter values against schema enums ─────────────────
    if (status && !ALLOWED_ORDER_STATUSES.includes(status)) {
      throw AppError.badRequest(
        `Invalid order status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`
      );
    }

    if (paymentStatus && !ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      throw AppError.badRequest(
        `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(', ')}`
      );
    }

    if (paymentMethod && !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      throw AppError.badRequest(
        `Invalid payment method. Allowed values: ${ALLOWED_PAYMENT_METHODS.join(', ')}`
      );
    }

    // ── Execute repository query ────────────────────────────────────
    const { orders, totalCount } = await adminOrderRepository.findAllOrders({
      limit,
      offset,
      status,
      paymentStatus,
      paymentMethod
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  },

  /**
   * Retrieve a specific order by ID, including line items.
   *
   * @param {string} orderId - UUID of the order.
   * @returns {Promise<Object>} The complete order object with items.
   * @throws {AppError} 400 if ID missing, 404 if order not found.
   */
  async getOrderById(orderId) {
    if (!orderId) {
      throw AppError.badRequest('Order ID is required.');
    }

    const order = await adminOrderRepository.findOrderById(orderId);

    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    return order;
  },

  /**
   * Update order status and optional tracking/notes fields.
   *
   * STATE MACHINE ENFORCEMENT:
   * - Terminal states ('delivered', 'cancelled') block further transitions.
   * - Status transitions automatically stamp the corresponding timestamp
   *   column (confirmed_at, shipped_at, delivered_at, cancelled_at).
   *
   * @param {string} orderId - UUID of the order to update.
   * @param {Object} updateData - Fields to update.
   * @param {string} [updateData.orderStatus]    - New order_status enum value.
   * @param {string} [updateData.trackingNumber] - Courier tracking number.
   * @param {string} [updateData.adminNotes]     - Internal admin notes.
   * @returns {Promise<Object>} The updated order summary.
   * @throws {AppError} 400/404 on validation or lookup failures.
   */
  async updateOrderStatus(orderId, updateData) {
    if (!orderId) {
      throw AppError.badRequest('Order ID is required.');
    }

    const { orderStatus, trackingNumber, adminNotes } = updateData;

    if (orderStatus) {
      if (!ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
        throw AppError.badRequest(
          `Invalid order status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`
        );
      }

      // Fetch the order to enforce state machine rules
      const existingOrder = await adminOrderRepository.findOrderById(orderId);
      if (!existingOrder) {
        throw AppError.notFound('Order not found.');
      }

      // Terminal states cannot be transitioned
      if (['delivered', 'cancelled'].includes(existingOrder.order_status)) {
        throw AppError.badRequest(
          `Cannot change status of a ${existingOrder.order_status} order.`
        );
      }
    }

    const updatedOrder = await adminOrderRepository.updateOrderStatus(orderId, {
      orderStatus,
      trackingNumber,
      adminNotes
    });

    if (!updatedOrder) {
      if (!orderStatus && trackingNumber === undefined && adminNotes === undefined) {
        throw AppError.badRequest('No valid fields to update.');
      }
      throw AppError.notFound('Order not found or no changes made.');
    }

    return updatedOrder;
  }
};

module.exports = adminOrderService;
