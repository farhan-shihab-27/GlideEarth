import Skeleton from "@/components/ui/Skeleton";

/**
 * Streamed in via <Suspense> while `FeaturedCategories` awaits the live
 * `/categories` API call. Mirrors the real section's structure (header +
 * bento grid) so there is no layout shift when the data resolves.
 */
export default function FeaturedCategoriesSkeleton() {
  return (
    <section className="relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-10 w-72 max-w-full rounded-2xl" />
            <Skeleton className="h-4 w-full max-w-md rounded-full" />
          </div>
          <Skeleton className="hidden h-5 w-40 rounded-full sm:block" />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="aspect-[16/10] sm:col-span-2 lg:col-span-2" />
          <Skeleton className="aspect-[4/5]" />
          <Skeleton className="aspect-[4/5]" />
        </div>
      </div>
    </section>
  );
}
