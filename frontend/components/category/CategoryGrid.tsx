"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ApiCategory } from "@/lib/api";
import { cn } from "@/lib/utils";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

export default function CategoryGrid({ categories }: { categories: ApiCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, index) => {
        const isLarge = index === 0;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: easeSmooth }}
            className={cn(isLarge && "sm:col-span-2 lg:col-span-2")}
          >
            <Link
              href={`/shop/${category.slug}`}
              className={cn(
                "group relative block h-full w-full overflow-hidden rounded-4xl shadow-card transition-shadow duration-500 hover:shadow-card-hover",
                isLarge ? "aspect-[16/10]" : "aspect-[4/5]"
              )}
            >
              {category.image_url && (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes={
                    isLarge
                      ? "(min-width: 1024px) 66vw, 100vw"
                      : "(min-width: 1024px) 33vw, 100vw"
                  }
                  className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-charcoal-950/10 to-transparent transition-opacity duration-500 group-hover:from-charcoal-950/90" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-8">
                <div>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-beige-100 backdrop-blur">
                    {category.product_count} {category.product_count === 1 ? "Item" : "Items"}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl text-cream sm:text-3xl">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-beige-200/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {category.description}
                    </p>
                  )}
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta-500 text-cream shadow-glow transition-transform duration-500 ease-smooth group-hover:rotate-45">
                  <ArrowUpRight className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
