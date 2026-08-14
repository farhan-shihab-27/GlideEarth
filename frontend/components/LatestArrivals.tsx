"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Star } from "lucide-react";
import { latestArrivals } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

export default function LatestArrivals() {
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
          <Button href="/shop" variant="outline" className="border-beige-100/20 text-cream hover:border-terracotta-400 hover:text-terracotta-300" icon={<ArrowRight className="h-4 w-4" />}>
            Get Inspired
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latestArrivals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: index * 0.1, ease: easeSmooth }}
              className="group relative flex flex-col overflow-hidden rounded-4xl bg-cream shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
                />

                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-terracotta-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream shadow-glow">
                    {product.badge}
                  </span>
                )}

                <button
                  aria-label="Add to wishlist"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-charcoal-800 opacity-0 shadow-soft backdrop-blur transition-all duration-300 group-hover:opacity-100 hover:bg-terracotta-500 hover:text-cream"
                >
                  <Heart className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <span className="text-xs font-medium uppercase tracking-wider text-terracotta-600">
                  {product.category}
                </span>
                <h3 className="mt-2 font-serif text-lg text-charcoal-900">
                  {product.name}
                </h3>

                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={
                        i < Math.round(product.rating)
                          ? "h-3.5 w-3.5 fill-terracotta-500 text-terracotta-500"
                          : "h-3.5 w-3.5 text-charcoal-200"
                      }
                    />
                  ))}
                  <span className="ml-1 text-xs text-charcoal-400">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-serif text-xl text-charcoal-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-charcoal-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>

                <Button
                  href={product.href}
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full justify-center"
                >
                  View Product
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
