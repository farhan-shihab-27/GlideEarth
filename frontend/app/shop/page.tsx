import Image from "next/image";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { ApiError, getCategories, getProductsByCategory } from "@/lib/api";
import type { ApiCategory, ApiProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: "Shop All Products — Glideearth",
  description:
    "Explore our entire handcrafted collection — lighters, jewelry, accessories & home décor.",
};

// ============================================================================
// PRODUCT CARD — White-box pattern matching category page
// ============================================================================

function ProductCard({ product }: { product: ApiProduct }) {
  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price < product.regular_price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-white shadow-card hover:shadow-card-hover transition-shadow duration-500 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-beige-100 overflow-hidden">
        {product.primary_image_url ? (
          <Image
            src={product.primary_image_url}
            alt={product.primary_image_alt || product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-beige-200" />
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-terracotta-500 text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <p className="font-sans text-[10px] uppercase tracking-wider text-terracotta-600 font-medium">
          {product.category_name}
        </p>
        <h3 className="font-sans text-sm font-medium text-charcoal-800 leading-snug line-clamp-2 group-hover:text-terracotta-600 transition-colors duration-300">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="font-serif text-base font-medium text-charcoal-900">
            {formatPrice(product.effective_price)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-xs text-charcoal-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// STATIC CATEGORY NAV ITEMS (always shown even if API fails)
// ============================================================================

const STATIC_CATEGORIES = [
  { label: "Lighter", slug: "lighter" },
  { label: "Jewelry", slug: "jewelry" },
  { label: "Accessories", slug: "accessories" },
  { label: "Home & Living", slug: "home-living" },
];

// ============================================================================
// PAGE — SERVER COMPONENT
// ============================================================================

export default async function ShopPage() {
  let allProducts: ApiProduct[] = [];
  let rootCategories: ApiCategory[] = [];
  let failed = false;

  try {
    const categories = await getCategories();
    rootCategories = categories.filter((c) => c.parent_id === null);

    // Collect all sub-category slugs from children of roots
    const subCategories = rootCategories.flatMap((c) => c.children ?? []);

    // Fetch products for every sub-category in parallel
    const results = await Promise.allSettled(
      subCategories.map((sub) => getProductsByCategory(sub.slug, 50))
    );

    // Flatten and deduplicate by product.id
    const seen = new Set<string>();
    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const product of result.value) {
          if (!seen.has(product.id)) {
            seen.add(product.id);
            allProducts.push(product);
          }
        }
      }
    }
  } catch (err) {
    failed = true;
    const message = err instanceof ApiError ? err.message : "Unknown error";
    console.error(`[ShopPage] Failed to load products: ${message}`);
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="bg-beige-100 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 font-sans text-xs text-charcoal-400">
            <Link
              href="/"
              className="hover:text-terracotta-600 transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-charcoal-700 font-medium">Shop</span>
          </nav>
        </div>
      </div>

      {/* ── Page Hero Strip ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-beige-200 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-2">
            Full Collection
          </p>
          <h1 className="font-serif text-3xl font-medium text-charcoal-900 sm:text-4xl md:text-5xl">
            All Products
          </h1>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-charcoal-500">
            Explore our entire collection of handcrafted pieces — lighters,
            jewelry, accessories and home décor.
          </p>
        </div>
      </div>

      {/* ── 12-Column Grid Layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-10">

        {/* ── LEFT SIDEBAR ──────────────────────────────────────────────── */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-24 flex flex-col gap-5">

            {/* Collections nav */}
            <div className="rounded-sm border border-beige-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <LayoutGrid
                  className="h-4 w-4 text-terracotta-500"
                  strokeWidth={1.75}
                />
                <h3 className="font-serif text-sm font-medium text-charcoal-800 uppercase tracking-wide">
                  Collections
                </h3>
              </div>
              <nav className="flex flex-col">
                {STATIC_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="font-sans text-sm text-charcoal-700 hover:text-terracotta-600 transition-colors duration-200 py-2 border-b border-beige-100 last:border-0 flex items-center justify-between group"
                  >
                    {cat.label}
                    <ChevronRight className="h-3 w-3 text-charcoal-300 group-hover:text-terracotta-400 transition-colors" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Refine / filter */}
            <div className="rounded-sm border border-beige-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal
                  className="h-4 w-4 text-terracotta-500"
                  strokeWidth={1.75}
                />
                <h3 className="font-serif text-sm font-medium text-charcoal-800 uppercase tracking-wide">
                  Refine
                </h3>
              </div>
              <div className="mb-4">
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-2">
                  Price Range
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full bg-beige-50 border border-beige-200 rounded-sm px-3 py-2 font-sans text-xs text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 transition-colors"
                  />
                  <span className="text-charcoal-400 text-xs">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full bg-beige-50 border border-beige-200 rounded-sm px-3 py-2 font-sans text-xs text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 transition-colors"
                  />
                </div>
              </div>
              <p className="font-sans text-[10px] text-charcoal-400 italic">
                Advanced filters coming soon.
              </p>
            </div>

            {/* About blurb */}
            <div className="rounded-sm border border-terracotta-200 bg-terracotta-50 p-5">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-terracotta-700 mb-2">
                Handcrafted & Unique
              </p>
              <p className="font-sans text-xs text-charcoal-600 leading-relaxed">
                Every piece is made in small batches. No two items are exactly
                alike — that&apos;s what makes each one special.
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <main className="col-span-12 md:col-span-9">
          {/* Header row */}
          <div className="flex items-baseline justify-between gap-4 mb-8 pb-4 border-b border-beige-200">
            <h2 className="font-serif text-2xl font-light text-charcoal-900 sm:text-3xl tracking-tight">
              All Products
            </h2>
            <span className="font-sans text-xs text-charcoal-400 shrink-0">
              {allProducts.length} {allProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* Grid or empty state */}
          {failed || allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-full bg-beige-100 flex items-center justify-center mb-5">
                <SlidersHorizontal
                  className="h-7 w-7 text-charcoal-400"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-serif text-xl text-charcoal-700 mb-2">
                Products Coming Soon
              </h3>
              <p className="font-sans text-sm text-charcoal-400 max-w-sm leading-relaxed">
                We&apos;re adding new handcrafted pieces — please check back
                shortly or explore our collections.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors duration-200"
              >
                Back to Home
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
