import { ArrowRight } from "lucide-react";
import { ApiError, getFeaturedProducts } from "@/lib/api";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import FetchErrorState from "@/components/ui/FetchErrorState";
import ProductGrid from "@/components/product/ProductGrid";

/**
 * Server Component: fetches live featured products from the Glideearth
 * API on every request (`cache: "no-store"`) and streams the result in
 * via the <Suspense> boundary set up in `app/page.tsx`. Interactivity
 * (hover states, scroll-reveal animation) lives in the `ProductGrid`
 * client component.
 */
export default async function LatestArrivals() {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let failed = false;

  try {
    products = await getFeaturedProducts(4);
  } catch (err) {
    failed = true;
    const message = err instanceof ApiError ? err.message : "Unknown error";
    console.error(`[LatestArrivals] Failed to load featured products: ${message}`);
  }

  return (
    <section className="relative overflow-hidden bg-charcoal-950 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-beige-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-noise opacity-60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="New In Store"
            title="Latest Arrivals"
            description="Fresh off the workbench — the newest handcrafted pieces added to our collection this season."
            light
          />
          <Button
            href="/shop"
            variant="outline"
            className="border-beige-100/20 text-cream hover:border-terracotta-400 hover:text-terracotta-300"
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Get Inspired
          </Button>
        </div>

        <div className="mt-14">
          {failed || products.length === 0 ? (
            <FetchErrorState
              title="We're currently updating our catalog."
              description="New arrivals are on their way — please check back shortly."
              light
            />
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </section>
  );
}
