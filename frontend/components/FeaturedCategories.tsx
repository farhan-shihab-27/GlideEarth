import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ApiError, getCategories } from "@/lib/api";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import FetchErrorState from "@/components/ui/FetchErrorState";
import CategoryGrid from "@/components/category/CategoryGrid";

/**
 * Server Component: fetches live categories from the Glideearth API on
 * every request (`cache: "no-store"`) and streams the result in via the
 * <Suspense> boundary set up in `app/page.tsx`. Interactivity (hover,
 * scroll-reveal animation) lives in the `CategoryGrid` client component.
 */
export default async function FeaturedCategories() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let failed = false;

  try {
    categories = await getCategories();
  } catch (err) {
    failed = true;
    const message = err instanceof ApiError ? err.message : "Unknown error";
    console.error(`[FeaturedCategories] Failed to load categories: ${message}`);
  }

  return (
    <section className="relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Shop By Category"
            title="Featured Collections"
            description="Every collection is crafted in small batches, so each piece keeps a little of the maker's hand in it."
          />
          <Reveal delay={0.2}>
            <Link
              href="/shop"
              className="group hidden items-center gap-2 text-sm font-semibold text-charcoal-800 transition-colors hover:text-terracotta-600 sm:inline-flex"
            >
              View All Categories
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14">
          {failed || categories.length === 0 ? (
            <FetchErrorState />
          ) : (
            <CategoryGrid categories={categories} />
          )}
        </div>
      </div>
    </section>
  );
}
