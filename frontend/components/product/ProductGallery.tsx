"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ApiProductImage } from "@/lib/api";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: ApiProductImage[];
  productName: string;
};

const easeSmooth = [0.22, 1, 0.36, 1] as const;

/**
 * Large hero image with a subtle hover-zoom, plus thumbnail selection when
 * a product has more than one image. Degrades gracefully to a single
 * static hero when only one image exists.
 */
export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex] ?? sorted[0];

  if (!active) {
    return <div className="aspect-square w-full rounded-4xl bg-beige-200" />;
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: easeSmooth }}
        className="group relative aspect-square w-full overflow-hidden rounded-4xl bg-beige-100 shadow-card"
      >
        <Image
          src={active.image_url}
          alt={active.alt_text || productName}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
        />
      </motion.div>

      {sorted.length > 1 && (
        <div className="mt-4 flex gap-3">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1} of ${productName}`}
              aria-pressed={index === activeIndex}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors duration-300",
                index === activeIndex
                  ? "border-terracotta-500"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || productName}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
