const { db } = require('../../config');

/**
 * Order Repository
 * 
 * This repository handles database interactions for the checkout process and order retrieval.
 * MOST methods here accept a dedicated PostgreSQL `client` object instead of using the global pool.
 * This is CRITICAL for maintaining transactional integrity. In a transaction, all operations
 * must run on the exact same connection (client) so they can be committed or rolled back together.
 */
class OrderRepository {
  /**
   * Fetches products by their IDs and acquires row-level locks.
   * 
   * @param {Object} client - The dedicated pg client from the transaction pool.
   * @param {Array<string>} productIds - Array of product UUIDs.
   * @returns {Promise<Array>} List of locked product rows.
   * 
   * @description
   * The `FOR UPDATE` clause is crucial here. It acquires row-level exclusive locks on the
   * fetched product rows. This prevents a race condition (e.g., double-spend problem) where
   * two concurrent checkout requests attempt to buy the last remaining stock of an item simultaneously.
   * The second transaction will wait until the first completes (commits or rolls back) before
   * it can read the updated stock value.
   */
  async findProductsByIds(client, productIds) {
    const query = `
      SELECT id, name, slug, sku, regular_price, discount_price, stock_quantity, is_active
      FROM products
      WHERE id = ANY($1::uuid[]) AND deleted_at IS NULL
      FOR UPDATE
    `;
    const result = await client.query(query, [productIds]);
    return result.rows;
  }

  /**
   * Upserts a customer based on their phone number.
   * 
   * @param {Object} client - The transaction client.
   * @param {Object} customerData - Customer details.
   * @returns {Promise<Object>} The upserted customer record.
   */
  async upsertCustomer(client, { fullName, phoneNumber, email }) {
    const query = `
      INSERT INTO customers (full_name, phone_number, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (phone_number) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW()
      RETURNING id, full_name, phone_number, email
    `;
    const result = await client.query(query, [fullName, phoneNumber, email]);
    return result.rows[0];
  }

  /**
   * Inserts a shipping address for a customer.
   * 
   * @param {Object} client - The transaction client.
   * @param {Object} addressData - Shipping address details.
   * @returns {Promise<string>} The ID of the newly inserted address.
   */
  async insertAddress(client, { customerId, recipientName, phoneNumber, addressLine1, addressLine2, city, stateProvince, postalCode, country }) {
    const query = `
      INSERT INTO customer_addresses (customer_id, address_type, recipient_name, phone_number, address_line_1, address_line_2, city, state_province, postal_code, country)
      VALUES ($1, 'shipping', $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const result = await client.query(query, [
      customerId, recipientName, phoneNumber, addressLine1, addressLine2, city, stateProvince, postalCode, country
    ]);
    return result.rows[0].id;
  }

  /**
   * Inserts a new order.
   * 
   * @param {Object} client - The transaction client.
   * @param {Object} orderData - Order snapshot and totals.
   * @returns {Promise<Object>} The created order summary.
   * 
   * @description
   * The address details are snapshotted (denormalized) into the orders table here.
   * This is a deliberate violation of Third Normal Form (3NF) to achieve Boyce-Codd
   * Normal Form (BCNF) historical accuracy. An order is a historical record. If the
   * customer updates their saved address later, this specific order's delivery address
   * should NOT change.
   */
  async insertOrder(client, orderData) {
    const query = `
      INSERT INTO orders (
        customer_id, subtotal, discount_amount, shipping_charge, total_amount, 
        payment_method, shipping_name, shipping_phone, shipping_address_line_1, 
        shipping_address_line_2, shipping_city, shipping_state_province, 
        shipping_postal_code, shipping_country, customer_notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, order_number, order_status, payment_status, total_amount, placed_at
    `;
    
    const params = [
      orderData.customerId, orderData.subtotal, orderData.discountAmount || 0, orderData.shippingCharge || 0,
      orderData.totalAmount, orderData.paymentMethod, orderData.shippingName, orderData.shippingPhone,
      orderData.shippingAddressLine1, orderData.shippingAddressLine2, orderData.shippingCity,
      orderData.shippingStateProvince, orderData.shippingPostalCode, orderData.shippingCountry,
      orderData.customerNotes
    ];

    const result = await client.query(query, params);
    return result.rows[0];
  }

  /**
   * Bulk inserts order items using array unnesting for high performance.
   * 
   * @param {Object} client - The transaction client.
   * @param {string} orderId - The UUID of the parent order.
   * @param {Array<Object>} items - Array of formatted order item snapshots.
   * @returns {Promise<Array>} The inserted order items.
   * 
   * @description
   * Using unnest() allows us to insert multiple rows in a single parameterized query
   * without concatenating string values (which risks SQL injection) or hitting
   * parameter limits. BCNF snapshots of name, SKU, and unit price are saved here.
   */
  async insertOrderItems(client, orderId, items) {
    const productIds = items.map(i => i.productId);
    const names = items.map(i => i.productNameSnapshot);
    const skus = items.map(i => i.productSkuSnapshot);
    const quantities = items.map(i => i.quantity);
    const unitPrices = items.map(i => i.unitPriceAtPurchase);
    const subtotals = items.map(i => i.subtotal);

    const query = `
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, product_sku_snapshot, quantity, unit_price_at_purchase, subtotal)
      SELECT $1, unnest($2::uuid[]), unnest($3::text[]), unnest($4::text[]), unnest($5::int[]), unnest($6::numeric[]), unnest($7::numeric[])
      RETURNING id, product_name_snapshot, quantity, unit_price_at_purchase, subtotal
    `;

    const result = await client.query(query, [
      orderId, productIds, names, skus, quantities, unitPrices, subtotals
    ]);
    return result.rows;
  }

  /**
   * Deducts stock quantities for multiple products in a single operation.
   * 
   * @param {Object} client - The transaction client.
   * @param {Array<Object>} items - Array containing { productId, quantity }
   * 
   * @description
   * Updates multiple rows in a single query by joining against a dynamically built
   * VALUES clause. This is drastically faster and safer than running multiple sequential
   * UPDATE queries in a loop.
   */
  async deductStock(client, items) {
    if (!items || items.length === 0) return;

    // Dynamically build ($1::uuid, $2::int), ($3::uuid, $4::int)
    const valuesClauses = [];
    const params = [];
    let paramIndex = 1;

    for (const item of items) {
      valuesClauses.push(`($${paramIndex++}::uuid, $${paramIndex++}::int)`);
      params.push(item.productId, item.quantity);
    }

    const query = `
      UPDATE products AS p SET
        stock_quantity = p.stock_quantity - v.qty,
        updated_at = NOW()
      FROM (VALUES ${valuesClauses.join(', ')}) AS v(id, qty)
      WHERE p.id = v.id
    `;

    await client.query(query, params);
  }

  /**
   * Fetches a full order and its items by the auto-generated order number.
   * 
   * @param {string} orderNumber - The human-readable order number.
   * @returns {Promise<Object|null>} The complete order object.
   * 
   * @description
   * This is a NON-transactional read operation. It uses the global connection pool (db.query)
   * since it doesn't need to hold locks or group writes.
   */
  async findOrderByNumber(orderNumber) {
    const orderQuery = `
      SELECT id, order_number, order_status, payment_status, total_amount, 
             subtotal, discount_amount, shipping_charge, placed_at,
             shipping_name, shipping_phone, shipping_address_line_1,
             shipping_city, customer_notes
      FROM orders
      WHERE order_number = $1
    `;
    const orderResult = await db.query(orderQuery, [orderNumber]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    const itemsQuery = `
      SELECT product_name_snapshot, product_sku_snapshot, quantity, unit_price_at_purchase, subtotal
      FROM order_items
      WHERE order_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [order.id]);
    
    order.items = itemsResult.rows;
    return order;
  }
}

module.exports = new OrderRepository();
