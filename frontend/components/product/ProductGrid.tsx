"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import type { ApiProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

export default function ProductGrid({ products }: { products: ApiProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, delay: index * 0.1, ease: easeSmooth }}
          className="group relative flex flex-col overflow-hidden rounded-4xl bg-cream shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
        >
          <div className="relative aspect-square overflow-hidden">
            {product.primary_image_url && (
              <Image
                src={product.primary_image_url}
                alt={product.primary_image_alt || product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
              />
            )}

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
              {product.category_name}
            </span>
            <h3 className="mt-2 font-serif text-lg text-charcoal-900">{product.name}</h3>

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
                {formatPrice(product.effective_price)}
              </span>
              {product.discount_price !== null && (
                <span className="text-sm text-charcoal-400 line-through">
                  {formatPrice(product.regular_price)}
                </span>
              )}
            </div>

            <Button
              href={`/product/${product.slug}`}
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
  );
}
