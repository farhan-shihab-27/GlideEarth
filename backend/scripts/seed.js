/**
 * ============================================================================
 * GLIDEEARTH — DATABASE SEED SCRIPT (Phase 8 — Gorur Ghash Taxonomy)
 * ============================================================================
 * Populates the database with the complete 2-tier category taxonomy:
 *   - 4 Root Categories: Lighter, Jewelry, Accessories, Home & Living
 *   - 14 Sub-Categories nested beneath the roots
 *   - 2 dummy products per sub-category (28 total)
 *
 * USAGE:
 *   npm run db:seed
 *
 * IDEMPOTENCY:
 * ────────────
 * Safe to re-run. Truncates product_images, products, and categories
 * (in FK-safe cascade order) before inserting fresh data.
 * ============================================================================
 */

const { transaction, shutdown } = require('../src/config/database');

// ============================================================================
// ROOT CATEGORIES
// ============================================================================
// These are the 4 massive blocks displayed on the homepage.
// parent_id is intentionally null — they are top-level taxonomy nodes.
// ============================================================================

const ROOT_CATEGORIES = [
  {
    slug: 'lighter',
    name: 'Lighter',
    description: 'Hand-engraved, plasma, and custom-crafted flame lighters for every personality.',
    image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1400&q=80',
    sort_order: 0,
  },
  {
    slug: 'jewelry',
    name: 'Jewelry',
    description: 'One-of-a-kind resin and metal jewelry — necklaces, rings, earrings & bracelets.',
    image_url: 'https://images.unsplash.com/photo-1576022162879-d8a403c5b88b?auto=format&fit=crop&w=1400&q=80',
    sort_order: 1,
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Handcrafted everyday carry — churis, magnets, brooches, keychains & more.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1400&q=80',
    sort_order: 2,
  },
  {
    slug: 'home-living',
    name: 'Home & Living',
    description: 'Artisan-made pieces for your space — ashtrays, rugs, soaps & covers.',
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=80',
    sort_order: 3,
  },
];

// ============================================================================
// SUB-CATEGORIES
// ============================================================================
// Each entry references a rootSlug to establish the parent_id FK link.
// ============================================================================

const SUB_CATEGORIES = [
  // ── Lighter ────────────────────────────────────────────────────────────────
  {
    rootSlug: 'lighter',
    slug: 'vintage-lighter',
    name: 'Vintage Lighter',
    description: 'Classic, timeless designs with a worn, patina-finished aesthetic.',
    image_url: 'https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=800&q=80',
    sort_order: 0,
  },
  {
    rootSlug: 'lighter',
    slug: 'plasma-lighter',
    name: 'Plasma Lighter',
    description: 'Windproof electric arc lighters — no butane, no flame, pure plasma.',
    image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
  },
  {
    rootSlug: 'lighter',
    slug: 'custom-engraved-lighter',
    name: 'Custom Engraved Lighter',
    description: 'Personalized flame lighters with hand-etched names, dates, or motifs.',
    image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
  },

  // ── Jewelry ────────────────────────────────────────────────────────────────
  {
    rootSlug: 'jewelry',
    slug: 'necklace',
    name: 'Necklace',
    description: 'Hand-poured resin and metal pendants on adjustable chains.',
    image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80',
    sort_order: 0,
  },
  {
    rootSlug: 'jewelry',
    slug: 'ring',
    name: 'Ring',
    description: 'Bold statement rings and delicate bands cast in vibrant resin.',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
  },
  {
    rootSlug: 'jewelry',
    slug: 'earring',
    name: 'Earring',
    description: 'Lightweight, handcrafted earrings from translucent resin and gold findings.',
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
  },
  {
    rootSlug: 'jewelry',
    slug: 'bracelet',
    name: 'Bracelet',
    description: 'Wrist-worn artisan pieces blending resin, leather & metal charms.',
    image_url: 'https://images.unsplash.com/photo-1573408301185-9519f94815f4?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
  },

  // ── Accessories ────────────────────────────────────────────────────────────
  {
    rootSlug: 'accessories',
    slug: 'churi',
    name: 'Churi',
    description: 'Traditional bangles reimagined with contemporary resin artistry.',
    image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80',
    sort_order: 0,
  },
  {
    rootSlug: 'accessories',
    slug: 'magnet',
    name: 'Magnet',
    description: 'Decorative fridge magnets cast in miniature resin art forms.',
    image_url: 'https://images.unsplash.com/photo-1609766857385-b5f6b9e14e93?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
  },
  {
    rootSlug: 'accessories',
    slug: 'bag-brooch',
    name: 'Bag Brooch',
    description: 'Handcrafted brooches to adorn bags, lapels, and scarves.',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
  },
  {
    rootSlug: 'accessories',
    slug: 'keychain',
    name: 'Keychain',
    description: 'Leather, metal and resin keychains built for daily carry.',
    image_url: 'https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
  },
  {
    rootSlug: 'accessories',
    slug: 'phone-hipper',
    name: 'Phone Hipper',
    description: 'Handcrafted phone grip rings and stands with artisan flair.',
    image_url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80',
    sort_order: 4,
  },

  // ── Home & Living ──────────────────────────────────────────────────────────
  {
    rootSlug: 'home-living',
    slug: 'ashtray',
    name: 'Ashtray',
    description: 'Hand-finished resin and ceramic ashtrays as functional desk art.',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    sort_order: 0,
  },
  {
    rootSlug: 'home-living',
    slug: 'hand-knitted-rug',
    name: 'Hand Knitted Rug',
    description: 'Cozy, handwoven rugs and table covers crafted from natural yarns.',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    sort_order: 1,
  },
  {
    rootSlug: 'home-living',
    slug: 'soap',
    name: 'Soap',
    description: 'Artisan cold-process soaps with botanicals, essential oils & natural colorants.',
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
    sort_order: 2,
  },
  {
    rootSlug: 'home-living',
    slug: 'cp-cover',
    name: 'C/P Cover',
    description: 'Hand-stitched cushion and pillow covers with artisan embroidery.',
    image_url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80',
    sort_order: 3,
  },
];

// ============================================================================
// PRODUCTS — 2 per sub-category (28 total)
// ============================================================================
// Each entry references a subSlug (the sub-category) for its category_id.
// Product images use high-quality Unsplash URLs matching the product type.
// ============================================================================

const PRODUCTS = [
  // ── Vintage Lighter ─────────────────────────────────────────────────────
  {
    subSlug: 'vintage-lighter',
    name: 'Brass Flame Vintage Lighter',
    slug: 'brass-flame-vintage-lighter',
    sku: 'GE-VLT-0001',
    short_description: 'A hand-engraved vintage brass lighter with a patina finish.',
    description: 'Our Brass Flame Vintage Lighter is crafted from solid brass and hand-engraved by our artisans. Each piece carries a unique flame motif with a warm, aged patina that grows more beautiful with use. Refillable butane core, windproof flame, and a keepsake gift box included.',
    regular_price: 34.99, discount_price: null, stock_quantity: 40,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'vintage-lighter',
    name: 'Copper Rose Vintage Lighter',
    slug: 'copper-rose-vintage-lighter',
    sku: 'GE-VLT-0002',
    short_description: 'A copper-toned vintage lighter engraved with a rose motif.',
    description: 'The Copper Rose Vintage Lighter marries old-world craftsmanship with a romantic rose engraving. Finished in a warm copper tone that develops a rich patina over years of use. Refillable and built to be a daily companion for decades.',
    regular_price: 38.00, discount_price: 30.00, stock_quantity: 25,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=900&q=80',
  },

  // ── Plasma Lighter ──────────────────────────────────────────────────────
  {
    subSlug: 'plasma-lighter',
    name: 'Arc Storm Plasma Lighter',
    slug: 'arc-storm-plasma-lighter',
    sku: 'GE-PLT-0001',
    short_description: 'Dual-arc electric plasma lighter — windproof and USB rechargeable.',
    description: 'The Arc Storm Plasma Lighter generates a powerful dual electric arc, eliminating the need for butane entirely. Fully windproof and USB-C rechargeable, it lasts up to 300 ignitions per charge. Housed in a slim matte-black zinc alloy body with a magnetic closure.',
    regular_price: 42.00, discount_price: null, stock_quantity: 55,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'plasma-lighter',
    name: 'Neo Coil Plasma Lighter',
    slug: 'neo-coil-plasma-lighter',
    sku: 'GE-PLT-0002',
    short_description: 'Slim single-coil plasma lighter with a brushed steel finish.',
    description: 'Minimalist and powerful, the Neo Coil Plasma Lighter delivers a precise single electric arc in a pocket-slim body. Brushed stainless steel housing, micro-USB charging port, and 200 ignitions per full charge. Perfect for the modern minimalist.',
    regular_price: 29.99, discount_price: null, stock_quantity: 70,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80',
  },

  // ── Custom Engraved Lighter ─────────────────────────────────────────────
  {
    subSlug: 'custom-engraved-lighter',
    name: 'Monogram Engraved Lighter',
    slug: 'monogram-engraved-lighter',
    sku: 'GE-CEL-0001',
    short_description: 'Personalized silver lighter with hand-engraved monogram initials.',
    description: 'Make it truly yours — the Monogram Engraved Lighter is hand-etched to order with your chosen initials or short text. Crafted from polished silver-tone zinc alloy with a smooth matte finish. Ships in 3–5 business days in a luxury gift box.',
    regular_price: 44.00, discount_price: null, stock_quantity: 20,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1609766857385-b5f6b9e14e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'custom-engraved-lighter',
    name: 'Zodiac Engraved Flame Lighter',
    slug: 'zodiac-engraved-flame-lighter',
    sku: 'GE-CEL-0002',
    short_description: 'Refillable lighter with your zodiac constellation hand-engraved.',
    description: 'Celestially inspired: the Zodiac Engraved Flame Lighter carries the constellation of your chosen star sign, meticulously etched by hand onto a brushed chrome body. A deeply personal gift that lights up any occasion.',
    regular_price: 46.00, discount_price: 38.00, stock_quantity: 15,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=900&q=80',
  },

  // ── Necklace ────────────────────────────────────────────────────────────
  {
    subSlug: 'necklace',
    name: 'Ocean Wave Resin Pendant',
    slug: 'ocean-wave-resin-pendant',
    sku: 'GE-NCK-0001',
    short_description: 'A hand-poured resin pendant capturing the swirl of ocean waves.',
    description: 'Cast in small batches, the Ocean Wave Resin Pendant layers deep-blue and seafoam pigments in slow, deliberate pours. The crystal-clear resin dome is hand-sanded to a glass-like shine and set in a gold-tone bezel with an 18-inch adjustable chain.',
    regular_price: 36.00, discount_price: 28.50, stock_quantity: 25,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1614367989578-40d097412e2b?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'necklace',
    name: 'Dried Flower Resin Locket',
    slug: 'dried-flower-resin-locket',
    sku: 'GE-NCK-0002',
    short_description: 'A locket preserving real dried petals in clear resin forever.',
    description: 'Each Dried Flower Resin Locket preserves hand-selected botanical petals inside a clear resin teardrop. No two lockets hold the same arrangement — your necklace is the only one exactly like it. Set on a delicate 20-inch gold-tone chain.',
    regular_price: 40.00, discount_price: null, stock_quantity: 18,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=900&q=80',
  },

  // ── Ring ────────────────────────────────────────────────────────────────
  {
    subSlug: 'ring',
    name: 'Rainbow Resin Statement Ring',
    slug: 'rainbow-resin-statement-ring',
    sku: 'GE-RNG-0001',
    short_description: 'A bold, colorful statement ring hand-cast in vibrant resin.',
    description: 'Hand-poured in small batches, the Rainbow Resin Statement Ring layers vivid pigments in a gradient swirl so every ring is one of a kind. The chunky silhouette sits comfortably on the finger, cast around a nickel-free adjustable band.',
    regular_price: 22.00, discount_price: null, stock_quantity: 30,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1515168746408-0f924dbb5c39?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'ring',
    name: 'Galaxy Dome Resin Ring',
    slug: 'galaxy-dome-resin-ring',
    sku: 'GE-RNG-0002',
    short_description: 'A deep-space galaxy captured in a high-dome resin ring.',
    description: 'The Galaxy Dome Resin Ring contains a miniature universe of swirling dark blue, violet, and silver glitter pigments, suspended in a polished resin hemisphere. Each piece is UV-cured for lasting clarity and durability, on a comfortable adjustable band.',
    regular_price: 26.00, discount_price: null, stock_quantity: 20,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
  },

  // ── Earring ─────────────────────────────────────────────────────────────
  {
    subSlug: 'earring',
    name: 'Pastel Teardrop Resin Earrings',
    slug: 'pastel-teardrop-resin-earrings',
    sku: 'GE-ERG-0001',
    short_description: 'Lightweight pastel resin teardrops on gold-filled hooks.',
    description: 'The Pastel Teardrop Resin Earrings are poured from our signature blush-pink and mint resin blend, sanded to a smooth finish and hung from nickel-free gold-filled hooks. Lightweight enough for all-day wear, bold enough to complete any look.',
    regular_price: 18.00, discount_price: 14.00, stock_quantity: 45,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'earring',
    name: 'Geometric Resin Stud Earrings',
    slug: 'geometric-resin-stud-earrings',
    sku: 'GE-ERG-0002',
    short_description: 'Minimalist hexagonal resin studs in muted earth tones.',
    description: 'Clean lines meet artisan craft: the Geometric Resin Stud Earrings are hand-cast in hexagonal moulds from a warm terracotta and cream resin blend. Set on sterling silver posts, they are the perfect minimalist statement for any outfit.',
    regular_price: 16.00, discount_price: null, stock_quantity: 60,
    is_featured: true, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1576022162879-d8a403c5b88b?auto=format&fit=crop&w=900&q=80',
  },

  // ── Bracelet ────────────────────────────────────────────────────────────
  {
    subSlug: 'bracelet',
    name: 'Amber Resin Bangle',
    slug: 'amber-resin-bangle',
    sku: 'GE-BRC-0001',
    short_description: 'A wide resin bangle in warm amber tones with gold leaf inclusions.',
    description: 'The Amber Resin Bangle is cast from a warm, honey-toned resin with suspended gold leaf flakes that catch the light beautifully. Each piece is hand-poured and sanded to a perfect high-gloss finish. Fits most wrist sizes comfortably.',
    regular_price: 30.00, discount_price: null, stock_quantity: 22,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1573408301185-9519f94815f4?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'bracelet',
    name: 'Woven Macramé Charm Bracelet',
    slug: 'woven-macrame-charm-bracelet',
    sku: 'GE-BRC-0002',
    short_description: 'A hand-knotted macramé bracelet with a resin heart charm.',
    description: 'Combining traditional fiber arts with modern resin craft, the Woven Macramé Charm Bracelet is hand-knotted from 100% cotton cord with a central hand-poured resin heart charm in your choice of color. Adjustable sliding knot closure.',
    regular_price: 24.00, discount_price: 19.00, stock_quantity: 35,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=80',
  },

  // ── Churi ───────────────────────────────────────────────────────────────
  {
    subSlug: 'churi',
    name: 'Festival Resin Churi Set',
    slug: 'festival-resin-churi-set',
    sku: 'GE-CHR-0001',
    short_description: 'A set of 6 vibrant resin churis in a gradient color palette.',
    description: 'The Festival Resin Churi Set contains six hand-poured bangles in a gorgeous sunset gradient — from deep terracotta to blush rose. Each churi is UV-cured for long-lasting color, with a smooth internal surface for comfortable all-day wear.',
    regular_price: 28.00, discount_price: null, stock_quantity: 40,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'churi',
    name: 'Minimalist Pearl Churi',
    slug: 'minimalist-pearl-churi',
    sku: 'GE-CHR-0002',
    short_description: 'A slim, elegant bangle with embedded pearl accents in white resin.',
    description: 'Understated and refined, the Minimalist Pearl Churi is a slim resin bangle with embedded freshwater pearl fragments suspended in translucent white resin. A single piece that works beautifully alone or stacked with others.',
    regular_price: 18.00, discount_price: null, stock_quantity: 50,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1609766857385-b5f6b9e14e93?auto=format&fit=crop&w=900&q=80',
  },

  // ── Magnet ──────────────────────────────────────────────────────────────
  {
    subSlug: 'magnet',
    name: 'Floral Resin Fridge Magnet',
    slug: 'floral-resin-fridge-magnet',
    sku: 'GE-MGN-0001',
    short_description: 'A miniature resin art magnet with real dried flowers inside.',
    description: 'The Floral Resin Fridge Magnet is a tiny work of art — real dried wildflowers suspended in clear resin, set on a powerful neodymium magnet. Each piece is hand-arranged and unique. Perfect for a refrigerator, whiteboard, or any magnetic surface.',
    regular_price: 8.00, discount_price: null, stock_quantity: 100,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1609766857385-b5f6b9e14e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'magnet',
    name: 'Galaxy Swirl Resin Magnet',
    slug: 'galaxy-swirl-resin-magnet',
    sku: 'GE-MGN-0002',
    short_description: 'A deep-space galaxy swirl magnet cast in dark resin with glitter.',
    description: 'Bring a little cosmos to your kitchen: the Galaxy Swirl Resin Magnet features a dark navy and violet resin base swirled with silver glitter, capturing a galaxy in miniature. Set on a strong magnet — it holds up to 5 standard sheets of paper.',
    regular_price: 9.00, discount_price: null, stock_quantity: 80,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },

  // ── Bag Brooch ──────────────────────────────────────────────────────────
  {
    subSlug: 'bag-brooch',
    name: 'Resin Floral Bag Brooch',
    slug: 'resin-floral-bag-brooch',
    sku: 'GE-BBR-0001',
    short_description: 'A hand-poured resin floral brooch to adorn bags, coats & scarves.',
    description: 'The Resin Floral Bag Brooch features a delicate multi-petal flower cast in blush-pink resin with gold leaf accents, mounted on a strong steel brooch pin. Versatile enough for bags, blazers, scarves, or hair accessories.',
    regular_price: 14.00, discount_price: null, stock_quantity: 35,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'bag-brooch',
    name: 'Vintage Butterfly Brooch',
    slug: 'vintage-butterfly-brooch',
    sku: 'GE-BBR-0002',
    short_description: 'A translucent resin butterfly brooch with iridescent wing detail.',
    description: 'The Vintage Butterfly Brooch captures the delicate beauty of a butterfly wing in tinted translucent resin. Iridescent mica powders create a shimmering, multi-colored effect that shifts in different light. Attached to a locking safety clasp pin.',
    regular_price: 16.00, discount_price: 12.00, stock_quantity: 28,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },

  // ── Keychain ────────────────────────────────────────────────────────────
  {
    subSlug: 'keychain',
    name: 'Heart Charm Resin Keychain',
    slug: 'heart-charm-resin-keychain',
    sku: 'GE-KEY-0001',
    short_description: 'A polished resin heart charm keychain in translucent rose.',
    description: 'A sentimental daily carry: the Heart Charm Resin Keychain is hand-cast from translucent rose-pink resin, sanded to a perfect dome, and attached to a durable stainless steel split ring with a lobster clasp. A small, meaningful gift.',
    regular_price: 12.00, discount_price: null, stock_quantity: 80,
    is_featured: true, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1727154085760-134cc942246e?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'keychain',
    name: 'Monogram Leather Keychain',
    slug: 'monogram-leather-keychain',
    sku: 'GE-KEY-0002',
    short_description: 'A vegetable-tanned leather keychain with gold-stamped initials.',
    description: 'The Monogram Leather Keychain is cut from full-grain, vegetable-tanned leather and hand-stamped with your chosen initial in a warm gold foil. Gets better with every scratch and scuff — developing a rich patina uniquely yours over time.',
    regular_price: 16.00, discount_price: null, stock_quantity: 45,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?auto=format&fit=crop&w=900&q=80',
  },

  // ── Phone Hipper ────────────────────────────────────────────────────────
  {
    subSlug: 'phone-hipper',
    name: 'Resin Mandala Phone Ring Stand',
    slug: 'resin-mandala-phone-ring-stand',
    sku: 'GE-PHN-0001',
    short_description: 'A hand-painted resin mandala phone grip ring and kickstand.',
    description: 'The Resin Mandala Phone Ring Stand is a hand-poured grip ring featuring a detailed mandala pattern in warm terracotta and cream. Rotating 360° and folding flat, it doubles as a kickstand for hands-free viewing. Universal 3M adhesive mount.',
    regular_price: 10.00, discount_price: null, stock_quantity: 90,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'phone-hipper',
    name: 'Floral Press Phone Grip',
    slug: 'floral-press-phone-grip',
    sku: 'GE-PHN-0002',
    short_description: 'A phone grip with real pressed wildflowers sealed in clear resin.',
    description: 'Carry a garden in your pocket: the Floral Press Phone Grip features hand-arranged pressed wildflowers suspended in a thick clear resin dome, mounted on a rotating ring stand with a 3M base. Every grip is botanically unique.',
    regular_price: 12.00, discount_price: null, stock_quantity: 65,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1609766857385-b5f6b9e14e93?auto=format&fit=crop&w=900&q=80',
  },

  // ── Ashtray ─────────────────────────────────────────────────────────────
  {
    subSlug: 'ashtray',
    name: 'Geode Resin Ashtray',
    slug: 'geode-resin-ashtray',
    sku: 'GE-ASH-0001',
    short_description: 'A heavy, hand-cast resin ashtray with a geode crystal pattern.',
    description: 'The Geode Resin Ashtray doubles as a striking desk sculpture. Cast from heavy-pour epoxy resin in deep amethyst, crystal, and black, each piece is individually poured and sanded to a smooth, flat finish. Heavy enough to stay put on any surface.',
    regular_price: 32.00, discount_price: null, stock_quantity: 18,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'ashtray',
    name: 'Marble Effect Round Ashtray',
    slug: 'marble-effect-round-ashtray',
    sku: 'GE-ASH-0002',
    short_description: 'A circular resin ashtray with a sophisticated white marble pattern.',
    description: 'Elegant and functional, the Marble Effect Round Ashtray is poured from white and charcoal resin in flowing veins that mimic natural Carrara marble. Smooth-sanded interior with four cigarette rests. A sophisticated addition to any surface.',
    regular_price: 28.00, discount_price: 22.00, stock_quantity: 20,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
  },

  // ── Hand Knitted Rug ────────────────────────────────────────────────────
  {
    subSlug: 'hand-knitted-rug',
    name: 'Chunky Knit Table Runner',
    slug: 'chunky-knit-table-runner',
    sku: 'GE-HKR-0001',
    short_description: 'A hand-knitted chunky cotton table runner in warm cream tones.',
    description: 'The Chunky Knit Table Runner is hand-loomed from 100% thick cotton in a classic open-weave diamond pattern. In a warm natural cream, it adds instant texture and warmth to any dining or side table. Machine washable on a gentle cycle.',
    regular_price: 45.00, discount_price: null, stock_quantity: 12,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'hand-knitted-rug',
    name: 'Boho Diamond Lap Cover',
    slug: 'boho-diamond-lap-cover',
    sku: 'GE-HKR-0002',
    short_description: 'A cosy hand-woven lap blanket with a bohemian diamond pattern.',
    description: 'Wrap yourself in artisan warmth: the Boho Diamond Lap Cover is hand-woven from a soft cotton-wool blend in a warm terracotta and cream palette. The repeating diamond motif is a traditional pattern reworked in contemporary earth tones.',
    regular_price: 55.00, discount_price: 44.00, stock_quantity: 8,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80',
  },

  // ── Soap ────────────────────────────────────────────────────────────────
  {
    subSlug: 'soap',
    name: 'Rose Clay Artisan Soap Bar',
    slug: 'rose-clay-artisan-soap-bar',
    sku: 'GE-SOP-0001',
    short_description: 'A cold-process soap bar with rose clay, lavender & shea butter.',
    description: 'Our Rose Clay Artisan Soap Bar is cold-processed in small batches with French rose clay, dried lavender buds, pure shea butter, and lavender essential oil. It lathers richly and leaves skin soft, with a gentle floral scent that lingers.',
    regular_price: 9.00, discount_price: null, stock_quantity: 120,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'soap',
    name: 'Charcoal & Tea Tree Detox Soap',
    slug: 'charcoal-tea-tree-detox-soap',
    sku: 'GE-SOP-0002',
    short_description: 'A deep-cleansing charcoal soap with tea tree and peppermint.',
    description: 'Formulated for deep purification, the Charcoal & Tea Tree Detox Soap combines activated charcoal, tea tree essential oil, and peppermint extract to draw out impurities and refresh the skin. Cold-processed to retain skin-nourishing glycerin.',
    regular_price: 10.00, discount_price: null, stock_quantity: 95,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
  },

  // ── C/P Cover ───────────────────────────────────────────────────────────
  {
    subSlug: 'cp-cover',
    name: 'Embroidered Floral Cushion Cover',
    slug: 'embroidered-floral-cushion-cover',
    sku: 'GE-CPC-0001',
    short_description: 'A hand-embroidered linen cushion cover with botanical floral motifs.',
    description: 'The Embroidered Floral Cushion Cover is stitched by hand on 100% natural linen with a botanical motif in warm terracotta, sage green, and cream thread. Hidden zip closure, fits standard 45×45cm insert. A quiet, artisan statement for your sofa.',
    regular_price: 38.00, discount_price: null, stock_quantity: 16,
    is_featured: false, sort_order: 0,
    image_url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=900&q=80',
  },
  {
    subSlug: 'cp-cover',
    name: 'Patchwork Cotton Pillow Cover',
    slug: 'patchwork-cotton-pillow-cover',
    sku: 'GE-CPC-0002',
    short_description: 'A hand-stitched patchwork pillow cover in vintage cotton prints.',
    description: 'The Patchwork Cotton Pillow Cover is assembled by hand from carefully curated vintage-print cotton scraps in warm, earthy tones. No two covers share the exact same patchwork arrangement. Envelope back opening, fits 45×45cm inserts.',
    regular_price: 32.00, discount_price: 25.00, stock_quantity: 20,
    is_featured: false, sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  },
];

// ============================================================================
// SEED LOGIC
// ============================================================================

async function seed() {
  console.log('[SEED] Connecting to database...');

  return transaction(async (client) => {
    // ── Clear existing data ────────────────────────────────────────────────
    console.log('[SEED] Clearing existing catalog data...');
    await client.query(
      'TRUNCATE TABLE product_images, products, categories RESTART IDENTITY CASCADE'
    );

    // ── Step 1: Insert root categories ─────────────────────────────────────
    console.log(`\n[SEED] Inserting ${ROOT_CATEGORIES.length} root categories...`);
    const rootIdBySlug = new Map();

    for (const cat of ROOT_CATEGORIES) {
      const { rows: [row] } = await client.query(
        `INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order, is_active)
         VALUES ($1, $2, $3, $4, NULL, $5, TRUE)
         RETURNING id`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
      );
      rootIdBySlug.set(cat.slug, row.id);
      console.log(`  ✔ [ROOT] ${cat.name} (${cat.slug})`);
    }

    // ── Step 2: Insert sub-categories (with parent_id FK) ──────────────────
    console.log(`\n[SEED] Inserting ${SUB_CATEGORIES.length} sub-categories...`);
    const subIdBySlug = new Map();

    for (const sub of SUB_CATEGORIES) {
      const parentId = rootIdBySlug.get(sub.rootSlug);
      if (!parentId) {
        throw new Error(`Root slug "${sub.rootSlug}" not found for sub-category "${sub.name}"`);
      }

      const { rows: [row] } = await client.query(
        `INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         RETURNING id`,
        [sub.name, sub.slug, sub.description, sub.image_url, parentId, sub.sort_order]
      );
      subIdBySlug.set(sub.slug, row.id);
      console.log(`  ✔ [SUB → ${sub.rootSlug}] ${sub.name} (${sub.slug})`);
    }

    // ── Step 3: Insert products + their primary images ─────────────────────
    console.log(`\n[SEED] Inserting ${PRODUCTS.length} products (2 per sub-category)...`);

    for (const product of PRODUCTS) {
      const categoryId = subIdBySlug.get(product.subSlug);
      if (!categoryId) {
        throw new Error(`Sub-category slug "${product.subSlug}" not found for product "${product.name}"`);
      }

      const { rows: [row] } = await client.query(
        `INSERT INTO products (
           category_id, name, slug, sku, short_description, description,
           regular_price, discount_price, stock_quantity,
           is_featured, is_active, sort_order
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11)
         RETURNING id`,
        [
          categoryId,
          product.name,
          product.slug,
          product.sku,
          product.short_description,
          product.description,
          product.regular_price,
          product.discount_price,
          product.stock_quantity,
          product.is_featured,
          product.sort_order,
        ]
      );

      // Insert primary product image
      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
         VALUES ($1, $2, $3, TRUE, 0)`,
        [row.id, product.image_url, product.name]
      );

      console.log(`  ✔ ${product.name} → [${product.subSlug}]`);
    }

    return {
      rootCount: ROOT_CATEGORIES.length,
      subCount: SUB_CATEGORIES.length,
      productCount: PRODUCTS.length,
    };
  });
}

seed()
  .then(async ({ rootCount, subCount, productCount }) => {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`[SEED] ✔ Done!`);
    console.log(`  → ${rootCount} root categories`);
    console.log(`  → ${subCount} sub-categories`);
    console.log(`  → ${productCount} products`);
    console.log('═══════════════════════════════════════════');
    await shutdown();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n[SEED] ✘ Seeding failed:');
    console.error(err.message);
    await shutdown();
    process.exit(1);
  });
