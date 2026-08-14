/**
 * ============================================================================
 * GLIDEEARTH — DATABASE SEED SCRIPT
 * ============================================================================
 * Populates a freshly-migrated database with the storefront's initial
 * catalog: the same categories & products the frontend previously rendered
 * from static mock data (`frontend/lib/data.ts`), now persisted as the
 * single source of truth in PostgreSQL.
 *
 * USAGE:
 *   npm run db:seed
 *
 * IDEMPOTENCY:
 * ────────────
 * Safe to re-run: it truncates `categories`, `products`, and
 * `product_images` (in that dependency order, via a single cascading
 * TRUNCATE) before inserting, so running this script twice in a row
 * produces the same end state rather than duplicate/conflicting rows.
 * ============================================================================
 */

const { transaction, shutdown } = require('../src/config/database');

// ============================================================================
// SEED DATA — mirrors frontend/lib/data.ts exactly (names, prices, ratings,
// badges, and Unsplash image URLs), remapped onto the real schema columns.
// ============================================================================

const CATEGORIES = [
  {
    slug: 'lighters',
    name: 'Custom Lighters',
    description: 'Hand-engraved flame lighters, personalized just for you.',
    image_url:
      'https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=1400&q=80',
    sort_order: 0,
  },
  {
    slug: 'jewelry',
    name: 'Resin Jewelry',
    description: 'One-of-a-kind rings, pendants & earrings cast by hand.',
    image_url:
      'https://images.unsplash.com/photo-1745192904087-dd0e68d8a6b5?auto=format&fit=crop&w=1200&q=80',
    sort_order: 1,
  },
  {
    slug: 'keychains',
    name: 'Keychains',
    description: 'Leather & metal keychains crafted to carry your story.',
    image_url:
      'https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?auto=format&fit=crop&w=1200&q=80',
    sort_order: 2,
  },
];

const PRODUCTS = [
  {
    categorySlug: 'lighters',
    name: 'Flame Vintage Lighter',
    slug: 'flame-vintage-lighter',
    sku: 'GE-LTR-0001',
    short_description: 'A hand-engraved vintage-style flame lighter, refillable and built to last.',
    regular_price: 34.99,
    discount_price: null,
    stock_quantity: 40,
    rating: 4.9,
    badge: 'Bestseller',
    is_featured: true,
    sort_order: 0,
    image_url:
      'https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=900&q=80',
  },
  {
    categorySlug: 'jewelry',
    name: 'Ocean Wave Resin Pendant',
    slug: 'ocean-wave-resin-pendant',
    sku: 'GE-JWL-0001',
    short_description: 'A hand-poured resin pendant capturing the swirl of ocean waves.',
    regular_price: 36.0,
    discount_price: 28.5,
    stock_quantity: 25,
    rating: 4.8,
    badge: 'New',
    is_featured: true,
    sort_order: 1,
    image_url:
      'https://images.unsplash.com/photo-1614367989578-40d097412e2b?auto=format&fit=crop&w=900&q=80',
  },
  {
    categorySlug: 'keychains',
    name: 'Heart Charm Keychain',
    slug: 'heart-charm-keychain',
    sku: 'GE-KEY-0001',
    short_description: 'A polished metal heart charm keychain, perfect for gifting.',
    regular_price: 16.0,
    discount_price: null,
    stock_quantity: 60,
    rating: 4.7,
    badge: null,
    is_featured: true,
    sort_order: 2,
    image_url:
      'https://images.unsplash.com/photo-1727154085760-134cc942246e?auto=format&fit=crop&w=900&q=80',
  },
  {
    categorySlug: 'jewelry',
    name: 'Rainbow Resin Statement Ring',
    slug: 'rainbow-resin-statement-ring',
    sku: 'GE-JWL-0002',
    short_description: 'A bold, colorful statement ring hand-cast in vibrant resin.',
    regular_price: 22.0,
    discount_price: null,
    stock_quantity: 30,
    rating: 5.0,
    badge: 'New',
    is_featured: true,
    sort_order: 3,
    image_url:
      'https://images.unsplash.com/photo-1515168746408-0f924dbb5c39?auto=format&fit=crop&w=900&q=80',
  },
];

// ============================================================================
// SEED LOGIC
// ============================================================================

async function seed() {
  console.log('[SEED] Connecting to database...');

  return transaction(async (client) => {
    console.log('[SEED] Clearing existing catalog data (categories, products, product_images)...');
    // Single statement so Postgres resolves the FK dependency order itself.
    await client.query('TRUNCATE TABLE product_images, products, categories RESTART IDENTITY CASCADE');

    // ── Insert categories ──────────────────────────────────────────────
    console.log(`[SEED] Inserting ${CATEGORIES.length} categories...`);
    const categoryIdBySlug = new Map();

    for (const category of CATEGORIES) {
      const { rows: [row] } = await client.query(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id`,
        [category.name, category.slug, category.description, category.image_url, category.sort_order]
      );
      categoryIdBySlug.set(category.slug, row.id);
      console.log(`  ✔ ${category.name} (${category.slug})`);
    }

    // ── Insert products + their primary image ───────────────────────────
    console.log(`[SEED] Inserting ${PRODUCTS.length} products...`);

    for (const product of PRODUCTS) {
      const categoryId = categoryIdBySlug.get(product.categorySlug);
      if (!categoryId) {
        throw new Error(`Unknown category slug "${product.categorySlug}" for product "${product.name}"`);
      }

      const { rows: [row] } = await client.query(
        `INSERT INTO products (
           category_id, name, slug, sku, short_description,
           regular_price, discount_price, stock_quantity,
           rating, badge, is_featured, is_active, sort_order
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, $12)
         RETURNING id`,
        [
          categoryId,
          product.name,
          product.slug,
          product.sku,
          product.short_description,
          product.regular_price,
          product.discount_price,
          product.stock_quantity,
          product.rating,
          product.badge,
          product.is_featured,
          product.sort_order,
        ]
      );

      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
         VALUES ($1, $2, $3, TRUE, 0)`,
        [row.id, product.image_url, product.name]
      );

      console.log(`  ✔ ${product.name} (${product.slug})`);
    }

    return { categoryCount: CATEGORIES.length, productCount: PRODUCTS.length };
  });
}

seed()
  .then(async ({ categoryCount, productCount }) => {
    console.log('');
    console.log(`[SEED] ✔ Done. Inserted ${categoryCount} categories and ${productCount} products.`);
    await shutdown();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[SEED] ✘ Seeding failed:');
    console.error(err.message);
    await shutdown();
    process.exit(1);
  });
