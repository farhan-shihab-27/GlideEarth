/**
 * Loading skeleton for the /category/[slug] page.
 * Rendered by Next.js while the Server Component fetches data.
 * Mirrors the exact 2-column grid layout of the page.
 */

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-sm bg-beige-200 ${className ?? ""}`}
    />
  );
}

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb skeleton */}
      <div className="bg-beige-100 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <SkeletonBlock className="h-3 w-48" />
        </div>
      </div>

      {/* Hero strip skeleton */}
      <div className="bg-white border-b border-beige-200 py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-10 w-56" />
          <SkeletonBlock className="h-4 w-96" />
        </div>
      </div>

      {/* 2-column layout skeleton */}
      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto px-4 py-10">
        {/* Sidebar skeleton */}
        <aside className="col-span-12 md:col-span-3 flex flex-col gap-5">
          <div className="border border-beige-200 bg-white p-5 space-y-3">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-4/5" />
          </div>
          <div className="border border-beige-200 bg-white p-5 space-y-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-8 w-full" />
            <SkeletonBlock className="h-3 w-20" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-8 flex-1" />
              <SkeletonBlock className="h-8 flex-1" />
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="col-span-12 md:col-span-9">
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-beige-200">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-3 w-20" />
          </div>

          {/* Sub-category card grid skeleton (2×3) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative aspect-square bg-beige-200 animate-pulse">
                {/* White box skeleton at bottom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] bg-white/90 py-3 px-2 shadow-sm space-y-1.5">
                  <SkeletonBlock className="h-3 w-3/4 mx-auto" />
                  <SkeletonBlock className="h-2.5 w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
