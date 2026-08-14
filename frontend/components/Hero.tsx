"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Flame, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const stats = [
  { label: "Happy Customers", value: "5,000+" },
  { label: "Handmade Pieces", value: "12,000+" },
  { label: "Average Rating", value: "4.9/5" },
];

const trustBadges = [
  {
    icon: Flame,
    title: "Handcrafted Quality",
    description: "Every piece made by artisan hands",
  },
  {
    icon: Truck,
    title: "Free Worldwide Shipping",
    description: "On all orders over $50",
  },
  {
    icon: ShieldCheck,
    title: "30-Day Guarantee",
    description: "Love it or your money back",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-beige-50 pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pb-40">
      {/* Ambient decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 animate-blob rounded-full bg-terracotta-200/40 blur-3xl" />
        <div className="absolute -right-16 top-40 h-96 w-96 animate-blob rounded-full bg-beige-300/50 blur-3xl [animation-delay:2s]" />
        <div className="absolute inset-0 bg-noise" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:gap-12 lg:px-10">
        {/* Left: copy */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600 shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Handcrafted With Passion
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-6 text-balance font-serif text-4xl leading-[1.1] text-charcoal-900 sm:text-5xl md:text-6xl">
              Wear Your Story,
              <br />
              <span className="text-terracotta-600">Carry Your Craft</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-balance text-lg leading-relaxed text-charcoal-500">
              Bespoke lighters, resin jewelry & keychains — each piece
              hand-poured, hand-engraved, and made to be treasured for years
              to come.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button href="/shop" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Shop Collection
              </Button>
              <Button href="/about" variant="outline" size="lg">
                Our Story
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-charcoal-900/10 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-serif text-2xl text-charcoal-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-charcoal-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Right: featured product visual */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-4xl shadow-card-hover"
          >
            <Image
              src="https://images.unsplash.com/photo-1767391255584-763f98ced9d0?auto=format&fit=crop&w=1200&q=80"
              alt="Handcrafted gold jewelry, elegantly displayed"
              fill
              priority
              sizes="(min-width: 1024px) 32rem, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/30 via-transparent to-transparent" />
          </motion.div>

          {/* Floating badge — bestseller */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -left-6 top-10 hidden animate-float items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-glass backdrop-blur-md sm:flex"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-100 text-terracotta-600">
              <Star className="h-5 w-5 fill-terracotta-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal-900">4.9 Rating</p>
              <p className="text-xs text-charcoal-500">2,300+ reviews</p>
            </div>
          </motion.div>

          {/* Floating badge — free shipping */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -right-4 bottom-16 hidden animate-float-slow items-center gap-3 rounded-2xl bg-charcoal-900/90 px-4 py-3 text-cream shadow-glass backdrop-blur-md sm:flex"
          >
            <Truck className="h-5 w-5 text-terracotta-300" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold">Free Shipping</p>
              <p className="text-xs text-beige-300/70">On orders over $50</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust badges strip */}
      <div className="relative mx-auto mt-20 max-w-7xl px-6 lg:px-10">
        <Reveal delay={0.15}>
          <div className="grid grid-cols-1 gap-4 rounded-4xl bg-white/70 p-3 shadow-soft backdrop-blur sm:grid-cols-3">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex items-center gap-4 rounded-3xl px-5 py-5 transition-colors duration-300 hover:bg-beige-100/80"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta-500/10 text-terracotta-600">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-900">
                      {badge.title}
                    </p>
                    <p className="text-xs text-charcoal-500">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
