import Link from "next/link";
import Image from "next/image";
import { ApiError, getCategories } from "@/lib/api";
import type { ApiCategory } from "@/lib/api";

/**
 * FeaturedCategories — Homepage Massive Category Blocks
 * =====================================================
 * Server Component. Fetches the root-level categories (parent_id = null)
 * and renders them as full-width, edge-to-edge hero blocks stacked
 * vertically — the "Gorur Ghash" style homepage pattern.
 *
 * Each block:
 *   - Full-width × 400px mobile / 600px desktop
 *   - object-cover background image
 *   - bg-black/40 dark overlay for text legibility
 *   - Category title dead center in Playfair Display, uppercase
 *   - Hover: subtle scale + terracotta underline reveal on the CTA
 *
 * Theme preserved: Playfair Display headings, Inter body, terracotta
 * accent hover, cream/charcoal palette — no Tailwind config changes.
 */
export default async function FeaturedCategories() {
  let allCategories: ApiCategory[] = [];
  let failed = false;

  try {
    allCategories = await getCategories();
  } catch (err) {
    failed = true;
    const message = err instanceof ApiError ? err.message : "Unknown error";
    console.error(`[FeaturedCategories] Failed to load categories: ${message}`);
  }

  // Only render root categories (parent_id === null) as the massive blocks
  const rootCategories = allCategories.filter((cat) => cat.parent_id === null);

  if (failed || rootCategories.length === 0) {
    return (
      <section className="bg-beige-50 py-24">
        <div className="mx-auto max-w-7xl px-6 text-center text-charcoal-500">
          <p className="font-sans text-base">
            Our collections are being updated — please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="bg-cream py-16 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600">
          Shop By Collection
        </p>
        <h2 className="mt-3 font-serif text-3xl font-medium text-charcoal-900 sm:text-4xl md:text-5xl">
          Featured Categories
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-charcoal-500">
          Every collection is crafted in small batches, so each piece keeps a
          little of the maker&apos;s hand in it.
        </p>
      </div>

      {/* Massive edge-to-edge category blocks */}
      <div className="flex flex-col">
        {rootCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative w-full h-[400px] md:h-[600px] overflow-hidden block"
          >
            {/* Background image */}
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 bg-charcoal-800" />
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/50" />

            {/* Dead-center title */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
              <h3 className="font-serif text-4xl font-medium uppercase tracking-widest text-white drop-shadow-md md:text-6xl">
                {category.name}
              </h3>

              {/* Sub-count badge */}
              {category.children && category.children.length > 0 && (
                <span className="font-sans text-xs uppercase tracking-[0.25em] text-white/70">
                  {category.children.length}{" "}
                  {category.children.length === 1 ? "Collection" : "Collections"}
                </span>
              )}

              {/* Animated CTA underline */}
              <span className="relative font-sans text-xs font-semibold uppercase tracking-[0.25em] text-cream/90 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-terracotta-400 after:transition-all after:duration-500 group-hover:text-white group-hover:after:w-full">
                Explore Collection
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
