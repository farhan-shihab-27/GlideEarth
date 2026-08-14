import Skeleton from "@/components/ui/Skeleton";

/**
 * Automatically wraps `page.tsx` in a <Suspense> boundary (Next.js file
 * convention). Mirrors the real PDP's two-column structure so navigation
 * feels instantaneous instead of jumping once the real content arrives.
 */
export default function Loading() {
  return (
    <section className="bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Skeleton className="h-4 w-28 rounded-full" />

        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Skeleton className="aspect-square w-full" />
            <div className="mt-4 flex gap-3">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <Skeleton className="h-20 w-20 rounded-2xl" />
            </div>
          </div>

          <div className="flex flex-col lg:pt-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="mt-4 h-10 w-4/5 rounded-2xl" />
            <Skeleton className="mt-4 h-4 w-40 rounded-full" />
            <Skeleton className="mt-6 h-9 w-32 rounded-xl" />

            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-2/3 rounded-full" />
            </div>

            <Skeleton className="mt-6 h-4 w-48 rounded-full" />

            <div className="mt-8 flex items-center gap-4">
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 flex-1 rounded-full sm:max-w-[240px]" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-charcoal-900/10 pt-8 sm:grid-cols-3">
              <Skeleton className="h-5 w-full rounded-full" />
              <Skeleton className="h-5 w-full rounded-full" />
              <Skeleton className="h-5 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
