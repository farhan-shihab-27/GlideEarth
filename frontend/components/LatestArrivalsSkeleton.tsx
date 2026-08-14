import Skeleton from "@/components/ui/Skeleton";

/**
 * Streamed in via <Suspense> while `LatestArrivals` awaits the live
 * `/products/featured` API call. Mirrors the real section's dark showcase
 * band + product-card grid so there is no layout shift on resolve.
 */
export default function LatestArrivalsSkeleton() {
  return (
    <section className="relative overflow-hidden bg-charcoal-950 py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-4">
            <Skeleton className="h-4 w-32 rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
            <Skeleton className="h-10 w-64 max-w-full rounded-2xl bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
            <Skeleton className="h-4 w-full max-w-md rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
          </div>
          <Skeleton className="h-11 w-40 rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-4xl bg-charcoal-900/60 p-3">
              <Skeleton className="aspect-square bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-20 rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
                <Skeleton className="h-5 w-32 rounded-lg bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
                <Skeleton className="h-9 w-full rounded-full bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
