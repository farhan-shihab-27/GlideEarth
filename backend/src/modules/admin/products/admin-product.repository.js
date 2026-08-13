/**
 * @fileoverview Admin Product Repository for database interactions.
 * Uses parameterized SQL queries and handles dynamic updates.
 */

const { db } = require('../../../config');

/**
 * Admin Product Repository methods.
 * @namespace adminProductRepository
 */
const adminProductRepository = {
  /**
   * Creates a new product in the database.
   * @param {object} client - The database client instance (for transactions).
   * @param {object} productData - The product data to insert.
   * @returns {Promise<object>} The inserted product record.
   */
  async createProduct(client, productData) {
    const sql = `
      INSERT INTO products (
        category_id, name, slug, sku, short_description, description,
        regular_price, discount_price, stock_quantity, low_stock_threshold,
        weight_grams, is_featured, is_active, sort_order, meta_title, meta_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    const params = [
      productData.categoryId,
      productData.name,
      productData.slug,
      productData.sku,
      productData.shortDescription,
      productData.description,
      productData.regularPrice,
      productData.discountPrice,
      productData.stockQuantity,
      productData.lowStockThreshold,
      productData.weightGrams,
      productData.isFeatured,
      productData.isActive,
      productData.sortOrder,
      productData.metaTitle,
      productData.metaDescription
    ];
    const { rows } = await client.query(sql, params);
    return rows[0];
  },

  /**
   * Inserts multiple product images in bulk.
   * @param {object} client - The database client instance (for transactions).
   * @param {number} productId - The ID of the product.
   * @param {Array<object>} images - Array of image objects.
   * @returns {Promise<Array<object>>} The inserted image records.
   */
  async insertProductImages(client, productId, images) {
    if (!images || images.length === 0) return [];

    const imageUrls = images.map(img => img.imageUrl);
    const altTexts = images.map(img => img.altText || '');
    const isPrimarys = images.map(img => img.isPrimary || false);
    const sortOrders = images.map(img => img.sortOrder || 0);

    const sql = `
      INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
      SELECT $1, unnest($2::text[]), unnest($3::text[]), unnest($4::boolean[]), unnest($5::int[])
      RETURNING id, image_url, alt_text, is_primary, sort_order
    `;
    const params = [productId, imageUrls, altTexts, isPrimarys, sortOrders];
    const { rows } = await client.query(sql, params);
    return rows;
  },

  /**
   * Dynamically updates a product in the database.
   * @param {number} productId - The ID of the product to update.
   * @param {object} updateData - Object containing fields to update.
   * @returns {Promise<object>} The updated product record.
   * @throws {Error} If no valid fields are provided.
   */
  async updateProduct(productId, updateData) {
    const fieldMapping = {
      categoryId: 'category_id',
      name: 'name',
      slug: 'slug',
      sku: 'sku',
      shortDescription: 'short_description',
      description: 'description',
      regularPrice: 'regular_price',
      discountPrice: 'discount_price',
      stockQuantity: 'stock_quantity',
      lowStockThreshold: 'low_stock_threshold',
      weightGrams: 'weight_grams',
      isFeatured: 'is_featured',
      isActive: 'is_active',
      sortOrder: 'sort_order',
      metaTitle: 'meta_title',
      metaDescription: 'meta_description'
    };

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (fieldMapping[key] !== undefined) {
        setClauses.push(`${fieldMapping[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields provided for update.');
    }

    setClauses.push(`updated_at = NOW()`);
    
    const sql = `
      UPDATE products 
      SET ${setClauses.join(', ')} 
      WHERE id = $${paramIndex} AND deleted_at IS NULL
      RETURNING *
    `;
    values.push(productId);

    const { rows } = await db.query(sql, values);
    return rows[0];
  },

  /**
   * Soft deletes a product by ID.
   * @param {number} productId - The ID of the product to delete.
   * @returns {Promise<object|null>} The deleted product record or null.
   */
  async softDeleteProduct(productId) {
    const sql = `
      UPDATE products 
      SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW() 
      WHERE id = $1 AND deleted_at IS NULL 
      RETURNING id, name, slug
    `;
    const { rows } = await db.query(sql, [productId]);
    return rows[0] || null;
  },

  /**
   * Finds an active (non-deleted) product by ID.
   * @param {number} productId - The ID of the product.
   * @returns {Promise<object|null>} The product record or null.
   */
  async findProductById(productId) {
    const sql = `
      SELECT p.*, c.name AS category_name 
      FROM products p 
      JOIN categories c ON c.id = p.category_id 
      WHERE p.id = $1 AND p.deleted_at IS NULL
    `;
    const { rows } = await db.query(sql, [productId]);
    return rows[0] || null;
  }
};

module.exports = adminProductRepository;
