import Skeleton from "@/components/ui/Skeleton";

/**
 * Streamed in via <Suspense> while `FeaturedCategories` awaits the live
 * `/categories` API call. Mirrors the new massive-block layout so there
 * is no layout shift when the data resolves.
 */
export default function FeaturedCategoriesSkeleton() {
  return (
    <div className="w-full">
      {/* Section header skeleton */}
      <div className="bg-cream py-16 flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-10 w-64 rounded-sm" />
        <Skeleton className="h-4 w-80 rounded-full" />
      </div>

      {/* Four full-width block skeletons */}
      <div className="flex flex-col">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="w-full h-[400px] md:h-[600px] rounded-none"
          />
        ))}
      </div>
    </div>
  );
}
