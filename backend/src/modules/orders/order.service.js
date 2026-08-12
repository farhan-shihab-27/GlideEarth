const { db } = require('../../config');
const AppError = require('../../utils/AppError');
const orderRepository = require('./order.repository');

// UUID validation regex
const UUID_V4_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;

/**
 * Order Service
 * 
 * Implements business logic and orchestrates database transactions for the checkout flow.
 * In the Controller-Service-Repository pattern, this acts as the "thick" layer where
 * all critical validation, calculations, and transactional logic reside.
 */
class OrderService {
  /**
   * Processes a complete checkout request within a single PostgreSQL transaction.
   * 
   * @param {Object} checkoutData - Structured checkout data from the client.
   * @returns {Promise<Object>} The confirmed order object.
   * 
   * @description
   * Transaction Lifecycle:
   * 1. PRE-TRANSACTION: Request payload is heavily validated.
   * 2. BEGIN: The `db.transaction` helper acquires a dedicated pg client and starts a transaction.
   * 3. LOCKING: `FOR UPDATE` is used to lock the relevant product rows in the database.
   * 4. BUSINESS RULES: Stock checks and price calculations are performed securely on the locked data.
   * 5. MUTATIONS: Customers, addresses, orders, and order items are sequentially written.
   * 6. STOCK DEDUCTION: Product stock is decreased safely.
   * 7. COMMIT/ROLLBACK: If everything succeeds, the transaction commits. If ANY error occurs,
   *    an exception is thrown and the transaction rolls back, undoing all partial changes instantly.
   */
  async checkout(checkoutData) {
    const { customer, shippingAddress, items, paymentMethod, customerNotes } = checkoutData;

    // 1. Initial Data Validation (Before entering the database transaction)
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

    // 2. Start PostgreSQL Transaction
    return await db.transaction(async (client) => {
      
      const productIds = items.map(item => item.productId);
      
      // 3. Acquire Row-Level Locks and Fetch Current DB State
      const products = await orderRepository.findProductsByIds(client, productIds);
      
      // 4. Verify all requested products exist and are active
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

      // 5. Stock Check and Price Calculation securely evaluated on the backend
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

      const shippingCharge = 0; // Configurable or dynamic later
      const discountAmount = 0; // Could evaluate coupon logic here later
      const totalAmount = orderSubtotal - discountAmount + shippingCharge;

      // 6. Execute Mutations sequentially inside the transaction lock
      
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

      // Deduct inventory reliably (safe from race conditions due to earlier FOR UPDATE locks)
      await orderRepository.deductStock(client, stockDeductions);

      // Transaction completes cleanly here. Commit happens automatically via the `db.transaction` wrapper.
      return orderRecord;
    });
  }

  /**
   * Retrieves an order by its public facing order number.
   * 
   * @param {string} orderNumber - The unique order string (e.g. ORD-12345).
   * @returns {Promise<Object>} The complete order and item data.
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
