import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { ApiError, getProductByIdentifier } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ProductGallery from "@/components/product/ProductGallery";
import ProductActions from "@/components/product/ProductActions";
import StockStatus from "@/components/product/StockStatus";
import FetchErrorState from "@/components/ui/FetchErrorState";

type ProductPageParams = { id: string };

/**
 * `cache()` dedupes this call within a single request, so `generateMetadata`
 * and the page component both resolve the same fetch instead of hitting the
 * API twice for one page load.
 */
const getProduct = cache((identifier: string) => getProductByIdentifier(identifier));

export async function generateMetadata({
  params,
}: {
  params: Promise<ProductPageParams>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProduct(id);
    return {
      title: `${product.meta_title || product.name} | Glideearth`,
      description:
        product.meta_description || product.short_description || undefined,
    };
  } catch {
    return { title: "Product | Glideearth" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<ProductPageParams>;
}) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }

    console.error(
      `[ProductPage] Failed to load product "${id}":`,
      err instanceof Error ? err.message : err
    );

    return (
      <section className="bg-cream px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <FetchErrorState
            title="We're having trouble loading this product."
            description="Please refresh the page or check back shortly."
          />
        </div>
      </section>
    );
  }

  const hasDiscount = product.discount_price !== null;

  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-2 text-sm font-medium text-charcoal-600 transition-colors hover:text-terracotta-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Shop
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="flex flex-col lg:pt-2">
            <Link
              href={`/shop/${product.category_slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 hover:underline"
            >
              {product.category_name}
            </Link>

            <h1 className="mt-3 font-serif text-3xl leading-tight text-charcoal-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < Math.round(product.rating)
                        ? "h-4 w-4 fill-terracotta-500 text-terracotta-500"
                        : "h-4 w-4 text-charcoal-200"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-charcoal-500">
                {product.rating.toFixed(1)} rating
              </span>
              {product.badge && (
                <span className="rounded-full bg-terracotta-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-terracotta-600">
                  {product.badge}
                </span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-3xl text-charcoal-900">
                {formatPrice(product.effective_price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-charcoal-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-terracotta-500 px-2.5 py-1 text-xs font-semibold text-cream">
                  Save {formatPrice(product.regular_price - product.effective_price)}
                </span>
              )}
            </div>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-charcoal-600">
              {product.description || product.short_description}
            </p>

            <div className="mt-6">
              <StockStatus
                stockQuantity={product.stock_quantity}
                lowStockThreshold={product.low_stock_threshold}
              />
            </div>

            <div className="mt-8">
              <ProductActions
                productId={product.id}
                productName={product.name}
                stockQuantity={product.stock_quantity}
              />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-charcoal-900/10 pt-8 sm:grid-cols-3">
              <div className="flex items-center gap-3 text-sm text-charcoal-600">
                <Truck className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={1.5} />
                Free shipping over $50
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-600">
                <RotateCcw className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={1.5} />
                30-day returns
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-600">
                <ShieldCheck className="h-5 w-5 shrink-0 text-terracotta-600" strokeWidth={1.5} />
                Handmade guarantee
              </div>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-charcoal-400">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
