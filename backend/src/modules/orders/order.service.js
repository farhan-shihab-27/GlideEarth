const { db } = require('../../config');
const AppError = require('../../utils/AppError');
const orderRepository = require('./order.repository');

// UUID validation regex
const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;

/**
 * ============================================================================
 * GLIDEEARTH — ORDER SERVICE (Business Logic Layer)
 * ============================================================================
 * Implements business logic and orchestrates database transactions for the
 * checkout flow. This is the "thick" layer where all critical validation,
 * calculations, coupon processing, and transactional logic reside.
 *
 * TRANSACTION LIFECYCLE:
 * ──────────────────────
 * 1. PRE-TRANSACTION: Request payload is heavily validated.
 * 2. BEGIN: `db.transaction` acquires a dedicated pg client.
 * 3. LOCKING: `FOR UPDATE` locks product rows against concurrent purchases.
 * 4. COUPON: Validate and calculate discount within the lock scope.
 * 5. BUSINESS RULES: Stock checks and price calculations on locked data.
 * 6. MUTATIONS: Customer, address, order, items, coupon records written.
 * 7. STOCK DEDUCTION: Inventory decreased safely.
 * 8. COMMIT/ROLLBACK: Automatic via the `db.transaction` wrapper.
 * ============================================================================
 */
class OrderService {
  /**
   * Processes a complete checkout request within a single PostgreSQL transaction.
   *
   * @param {Object} checkoutData - Structured checkout data from the client.
   * @param {Object} checkoutData.customer - Customer identity (fullName, phoneNumber, email).
   * @param {Object} checkoutData.shippingAddress - Shipping destination snapshot.
   * @param {Array}  checkoutData.items - Cart line items [{ productId, quantity }].
   * @param {string} checkoutData.paymentMethod - 'cod' or 'online'.
   * @param {string} [checkoutData.customerNotes] - Optional order notes.
   * @param {string} [checkoutData.couponCode] - Optional coupon code to apply.
   * @returns {Promise<Object>} The confirmed order object with discount details.
   */
  async checkout(checkoutData) {
    const { customer, shippingAddress, items, paymentMethod, customerNotes, couponCode } = checkoutData;

    // ─── 1. PRE-TRANSACTION VALIDATION ──────────────────────────────
    if (!customer || !customer.fullName || !customer.phoneNumber) {
      throw AppError.badRequest('Customer fullName and phoneNumber are required.');
    }

    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.phoneNumber || !shippingAddress.addressLine1 || !shippingAddress.city) {
      throw AppError.badRequest('Incomplete shipping address. recipientName, phoneNumber, addressLine1, and city are required.');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw AppError.badRequest('Cart is empty. Items array is required.');
    }

    for (const item of items) {
      if (!item.productId || !UUID_V4_REGEX.test(item.productId)) {
         throw AppError.badRequest(`Invalid productId format: ${item.productId}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw AppError.badRequest('Quantity must be greater than zero.');
      }
    }

    if (!['cod', 'online'].includes(paymentMethod)) {
      throw AppError.badRequest('Invalid paymentMethod. Must be "cod" or "online".');
    }

    // ─── 2. START POSTGRESQL TRANSACTION ─────────────────────────────
    return await db.transaction(async (client) => {

      const productIds = items.map(item => item.productId);

      // ─── 3. ACQUIRE ROW-LEVEL LOCKS ─────────────────────────────
      const products = await orderRepository.findProductsByIds(client, productIds);

      // Verify all requested products exist and are active
      if (products.length !== productIds.length) {
        throw AppError.badRequest('One or more products are unavailable or do not exist.');
      }

      // Map for O(1) product lookups during processing
      const productMap = products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      let orderSubtotal = 0;
      const orderItemsToInsert = [];
      const stockDeductions = [];

      // ─── 4. STOCK CHECK & PRICE CALCULATION ─────────────────────
      for (const item of items) {
        const product = productMap[item.productId];

        if (!product.is_active) {
          throw AppError.badRequest(`Product "${product.name}" is no longer active.`);
        }

        if (product.stock_quantity < item.quantity) {
          throw AppError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
        }

        const effectivePrice = product.discount_price || product.regular_price;
        const itemSubtotal = effectivePrice * item.quantity;
        orderSubtotal += itemSubtotal;

        // Build BCNF historical snapshots for the order_items table
        orderItemsToInsert.push({
          productId: product.id,
          productNameSnapshot: product.name,
          productSkuSnapshot: product.sku,
          quantity: item.quantity,
          unitPriceAtPurchase: effectivePrice,
          subtotal: itemSubtotal
        });

        stockDeductions.push({
          productId: product.id,
          quantity: item.quantity
        });
      }

      // ─── 5. COUPON VALIDATION & DISCOUNT CALCULATION ────────────
      // This runs INSIDE the transaction to guarantee atomicity:
      // If any later step fails (e.g., stock deduction), the coupon
      // usage increment is automatically rolled back.
      let discountAmount = 0;
      let couponRecord = null;

      if (couponCode) {
        const trimmedCode = couponCode.trim().toUpperCase();

        // Fetch the coupon (active, non-deleted only)
        couponRecord = await orderRepository.findActiveCouponByCode(client, trimmedCode);

        if (!couponRecord) {
          throw AppError.badRequest('Invalid or expired coupon code.');
        }

        // Date range validation
        const now = new Date();
        if (couponRecord.valid_from && new Date(couponRecord.valid_from) > now) {
          throw AppError.badRequest('This coupon is not yet active.');
        }
        if (couponRecord.valid_until && new Date(couponRecord.valid_until) < now) {
          throw AppError.badRequest('This coupon has expired.');
        }

        // Usage limit validation
        if (couponRecord.usage_limit !== null && couponRecord.times_used >= couponRecord.usage_limit) {
          throw AppError.badRequest('This coupon has reached its maximum usage limit.');
        }

        // Minimum order amount validation
        if (couponRecord.min_order_amount !== null && orderSubtotal < parseFloat(couponRecord.min_order_amount)) {
          throw AppError.badRequest(
            `Minimum order amount of ${couponRecord.min_order_amount} required to use this coupon.`
          );
        }

        // Calculate discount based on coupon type
        if (couponRecord.coupon_type === 'percentage') {
          discountAmount = orderSubtotal * (parseFloat(couponRecord.value) / 100);

          // Cap at max_discount_amount if set
          if (couponRecord.max_discount_amount !== null) {
            discountAmount = Math.min(discountAmount, parseFloat(couponRecord.max_discount_amount));
          }
        } else if (couponRecord.coupon_type === 'fixed_amount') {
          discountAmount = parseFloat(couponRecord.value);
        }

        // Discount can never exceed the subtotal
        discountAmount = Math.min(discountAmount, orderSubtotal);

        // Round to 2 decimal places for currency precision
        discountAmount = Math.round(discountAmount * 100) / 100;
      }

      const shippingCharge = 0; // Configurable or dynamic later
      const totalAmount = orderSubtotal - discountAmount + shippingCharge;

      // ─── 6. EXECUTE MUTATIONS SEQUENTIALLY ──────────────────────

      // Upsert Customer (create or update existing by phone)
      const customerRecord = await orderRepository.upsertCustomer(client, customer);

      // Save Shipping Address securely
      await orderRepository.insertAddress(client, {
        customerId: customerRecord.id,
        ...shippingAddress
      });

      // Create Parent Order Record
      const orderRecord = await orderRepository.insertOrder(client, {
        customerId: customerRecord.id,
        subtotal: orderSubtotal,
        discountAmount,
        shippingCharge,
        totalAmount,
        paymentMethod,
        shippingName: shippingAddress.recipientName,
        shippingPhone: shippingAddress.phoneNumber,
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingAddressLine2: shippingAddress.addressLine2,
        shippingCity: shippingAddress.city,
        shippingStateProvince: shippingAddress.stateProvince,
        shippingPostalCode: shippingAddress.postalCode,
        shippingCountry: shippingAddress.country,
        customerNotes
      });

      // Bulk Insert Order Items with snapshots
      await orderRepository.insertOrderItems(client, orderRecord.id, orderItemsToInsert);

      // ─── 7. COUPON JUNCTION RECORD & USAGE INCREMENT ────────────
      // Only if a coupon was successfully validated and applied
      if (couponRecord && discountAmount > 0) {
        await orderRepository.insertOrderCoupon(client, {
          orderId: orderRecord.id,
          couponId: couponRecord.id,
          codeSnapshot: couponRecord.code,
          discountApplied: discountAmount
        });

        await orderRepository.incrementCouponUsage(client, couponRecord.id);
      }

      // ─── 8. STOCK DEDUCTION ─────────────────────────────────────
      // Safe from race conditions due to earlier FOR UPDATE locks
      await orderRepository.deductStock(client, stockDeductions);

      // Transaction completes cleanly here. Commit happens automatically.
      return {
        ...orderRecord,
        discount_amount: discountAmount,
        coupon_applied: couponRecord ? couponRecord.code : null
      };
    });
  }

  /**
   * Retrieves an order by its public facing order number.
   *
   * @param {string} orderNumber - The unique order string (e.g. GE-20260812-00001).
   * @returns {Promise<Object>} The complete order and item data.
   * @throws {AppError} 400 if invalid, 404 if not found.
   */
  async getOrderByNumber(orderNumber) {
    if (!orderNumber || typeof orderNumber !== 'string') {
      throw AppError.badRequest('Valid order number is required.');
    }

    const order = await orderRepository.findOrderByNumber(orderNumber);

    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    return order;
  }
}

module.exports = new OrderService();
