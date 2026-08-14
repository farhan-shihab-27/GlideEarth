import { PackageX } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Rendered when `notFound()` is thrown from `page.tsx` — i.e. the requested
 * product slug/UUID doesn't match anything in the live catalog.
 */
export default function ProductNotFound() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-cream px-6 py-24">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600">
          <PackageX className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-charcoal-900">Product Not Found</h1>
        <p className="mt-3 text-base leading-relaxed text-charcoal-500">
          The piece you&rsquo;re looking for may have sold out or moved. Every
          Glideearth item is handmade in small batches, so our catalog is
          always evolving.
        </p>
        <Button href="/shop" size="lg" className="mt-8">
          Return to Shop
        </Button>
      </div>
    </section>
  );
}
