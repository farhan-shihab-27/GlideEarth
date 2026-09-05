import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Search, Clock, SlidersHorizontal } from "lucide-react";
import {
  ApiError,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/api";
import type { ApiCategory, ApiProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// ============================================================================
// SUB-CATEGORY CARD — "Gorur Ghash" White Box Pattern
// ============================================================================
// Renders a square image card with the signature white floating box at the
// bottom center. Exact Tailwind classes from the brief, themed to our
// InteriorStudio palette (Playfair for sub-title, Inter for count text).
// ============================================================================

function SubCategoryCard({ sub }: { sub: ApiCategory }) {
  return (
    <Link
      href={`/category/${sub.slug}`}
      className="relative aspect-square bg-charcoal-100 cursor-pointer group overflow-hidden block"
    >
      {/* Background product image */}
      {sub.image_url ? (
        <Image
          src={sub.image_url}
          alt={sub.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-beige-200" />
      )}

      {/* Subtle image darkening on hover */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

      {/* ── The Signature White Box ── */}
      {/* Exact classes from the brief, styled with our theme tokens */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white/95 py-3 px-2 text-center shadow-sm transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
        {/* Sub-category title: Playfair Display, uppercase, charcoal */}
        <p className="font-serif text-sm uppercase tracking-wide text-charcoal-800 leading-snug">
          {sub.name}
        </p>
        {/* Product count: Inter, muted gray */}
        <p className="mt-0.5 font-sans text-xs text-charcoal-400">
          {sub.product_count}{" "}
          {sub.product_count === 1 ? "Product" : "Products"}
        </p>
      </div>
    </Link>
  );
}

// ============================================================================
// PRODUCT CARD — Leaf-category product grid
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
      {/* Product image */}
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

      {/* Product info */}
      <div className="p-4 flex flex-col gap-1.5">
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
// LEFT SIDEBAR COMPONENTS
// ============================================================================

function RecentlyViewedSidebar() {
  return (
    <div className="rounded-sm border border-beige-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-terracotta-500" strokeWidth={1.75} />
        <h3 className="font-serif text-sm font-medium text-charcoal-800 uppercase tracking-wide">
          Recently Viewed
        </h3>
      </div>
      <p className="font-sans text-xs text-charcoal-400 leading-relaxed">
        Items you recently browsed will appear here for quick access.
      </p>
    </div>
  );
}

function FilterSidebar() {
  return (
    <div className="rounded-sm border border-beige-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4 text-terracotta-500" strokeWidth={1.75} />
        <h3 className="font-serif text-sm font-medium text-charcoal-800 uppercase tracking-wide">
          Filter & Search
        </h3>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal-400" strokeWidth={1.75} />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-beige-50 border border-beige-200 rounded-sm pl-8 pr-3 py-2 font-sans text-xs text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400 transition-colors"
        />
      </div>

      {/* Price range placeholder */}
      <div className="mb-4">
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-2">
          Price Range
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full bg-beige-50 border border-beige-200 rounded-sm px-3 py-2 font-sans text-xs text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400"
          />
          <span className="text-charcoal-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full bg-beige-50 border border-beige-200 rounded-sm px-3 py-2 font-sans text-xs text-charcoal-700 placeholder:text-charcoal-400 focus:outline-none focus:border-terracotta-400"
          />
        </div>
      </div>

      <p className="font-sans text-[10px] text-charcoal-400 italic">
        Advanced filters coming soon.
      </p>
    </div>
  );
}

// ============================================================================
// MAIN CATEGORY PAGE SERVER COMPONENT
// ============================================================================

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    return {
      title: `${category.name} — Glideearth`,
      description:
        category.description ||
        `Browse our handcrafted ${category.name} collection.`,
    };
  } catch {
    return {
      title: "Category — Glideearth",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // ── Fetch category (with children) ────────────────────────────────────────
  let category: ApiCategory;
  try {
    category = await getCategoryBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    // For any other error, also 404 — the error handler will log it
    notFound();
  }

  const isRootCategory = category.parent_id === null;
  const hasChildren = category.children && category.children.length > 0;

  // ── For leaf categories: fetch products ───────────────────────────────────
  let products: ApiProduct[] = [];
  if (!isRootCategory || !hasChildren) {
    try {
      products = await getProductsByCategory(slug);
    } catch {
      // Graceful degradation — products stay empty, UI shows empty state
    }
  }

  // ── Breadcrumb construction ────────────────────────────────────────────────
  // For a sub-category, we don't have the parent data here without an extra fetch.
  // We render a simple breadcrumb: Home → {category}
  // (A future enhancement can resolve the parent for deeper breadcrumbs.)

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Breadcrumb Bar ─────────────────────────────────────────────────── */}
      <div className="bg-beige-100 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 font-sans text-xs text-charcoal-400">
            <Link href="/" className="hover:text-terracotta-600 transition-colors duration-200">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <Link href="/category" className="hover:text-terracotta-600 transition-colors duration-200">
              Collections
            </Link>
            {!isRootCategory && category.parent_id && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-charcoal-500">{category.name}</span>
              </>
            )}
            {isRootCategory && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="text-charcoal-700 font-medium">{category.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* ── Page Hero Strip ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-beige-200 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-2">
            {isRootCategory ? "Main Collection" : "Sub-Collection"}
          </p>
          <h1 className="font-serif text-3xl font-medium text-charcoal-900 sm:text-4xl md:text-5xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-charcoal-500">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* ── 2-Column Layout ────────────────────────────────────────────────── */}
      {/* Grid: 12 columns — sidebar (3 col) + main content (9 col) */}
      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-10">

        {/* ── LEFT SIDEBAR (sticky) ─────────────────────────────────────────── */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-24 flex flex-col gap-5">
            <RecentlyViewedSidebar />
            <FilterSidebar />

            {/* Category description card — only on root pages */}
            {isRootCategory && category.description && (
              <div className="rounded-sm border border-terracotta-200 bg-terracotta-50 p-5">
                <p className="font-sans text-xs font-semibold uppercase tracking-wider text-terracotta-700 mb-2">
                  About this Collection
                </p>
                <p className="font-sans text-xs text-charcoal-600 leading-relaxed">
                  {category.description}
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT MAIN CONTENT ──────────────────────────────────────────── */}
        <main className="col-span-12 md:col-span-9">

          {/* Page title + item count */}
          <div className="flex items-baseline justify-between gap-4 mb-8 pb-4 border-b border-beige-200">
            <h2 className="font-serif text-2xl font-light text-charcoal-900 sm:text-3xl tracking-tight">
              {isRootCategory && hasChildren ? "Browse Sub-Collections" : "All Products"}
            </h2>
            <span className="font-sans text-xs text-charcoal-400 shrink-0">
              {isRootCategory && hasChildren
                ? `${category.children.length} collections`
                : `${products.length} products`}
            </span>
          </div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* ROUTE A: Root category → show sub-category white-box grid         */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {isRootCategory && hasChildren && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {category.children.map((sub) => (
                <SubCategoryCard key={sub.id} sub={sub} />
              ))}
            </div>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* ROUTE B: Leaf category → show product grid                        */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {(!isRootCategory || !hasChildren) && (
            <>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-beige-100 flex items-center justify-center mb-5">
                    <SlidersHorizontal className="h-7 w-7 text-charcoal-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl text-charcoal-700 mb-2">
                    Products Coming Soon
                  </h3>
                  <p className="font-sans text-sm text-charcoal-400 max-w-sm">
                    We&apos;re adding new handcrafted pieces to this collection.
                    Check back shortly or explore our other collections.
                  </p>
                  <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors duration-200"
                  >
                    Back to Home
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* EDGE CASE: Root with no children and no products                  */}
          {/* ────────────────────────────────────────────────────────────────── */}
          {isRootCategory && !hasChildren && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-sans text-sm text-charcoal-400">
                This collection is being curated. Please check back soon.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
