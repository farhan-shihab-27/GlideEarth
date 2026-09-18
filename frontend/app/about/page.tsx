import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, Heart, Award } from "lucide-react";

// ============================================================================
// METADATA
// ============================================================================

export const metadata = {
  title: "Our Story — Glideearth",
  description:
    "Learn about Glideearth — bespoke handcrafted lighters, resin jewelry & premium accessories made with passion.",
};

// ============================================================================
// VALUES DATA
// ============================================================================

const values = [
  {
    icon: Flame,
    title: "Handcrafted Quality",
    text: "Every piece passes through artisan hands. We don't do assembly lines — we do intention.",
  },
  {
    icon: Heart,
    title: "Made With Love",
    text: "Our studio runs on passion. If we wouldn't give it as a gift, we don't sell it.",
  },
  {
    icon: Award,
    title: "Uncompromising Standards",
    text: "From raw material to final polish, we obsess over every detail so you never have to.",
  },
];

const stats = [
  { value: "5,000+", label: "Happy Customers" },
  { value: "12,000+", label: "Handmade Pieces" },
  { value: "4.9 / 5", label: "Average Rating" },
  { value: "2019", label: "Year Founded" },
];

// ============================================================================
// PAGE — SERVER COMPONENT
// ============================================================================

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="bg-beige-100 border-b border-beige-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-1.5 font-sans text-xs text-charcoal-400">
            <Link
              href="/"
              className="hover:text-terracotta-600 transition-colors duration-200"
            >
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="text-charcoal-700 font-medium">About</span>
          </nav>
        </div>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-beige-200 py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">
            The Glideearth Story
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium text-charcoal-900 leading-tight">
            Crafted With Heart,
            <br />
            Built to Last.
          </h1>
          <p className="font-sans text-lg text-charcoal-500 mt-5 max-w-2xl mx-auto leading-relaxed">
            We believe every everyday object deserves to be extraordinary.
            Glideearth is where artisanal craft meets modern life.
          </p>
        </div>
      </div>

      {/* ── Zig-Zag Content Blocks ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="divide-y divide-beige-200">

          {/* Block 1 — Text left, Image right */}
          <div className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">
                Our Origins
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900 mb-6 leading-tight">
                Born From a Flame
              </h2>
              <div className="font-sans text-base text-charcoal-500 leading-relaxed flex flex-col gap-4">
                <p>
                  Glideearth began with a single brass lighter and a vision —
                  to create objects that tell a story. Our founder, a resin
                  artist and metalwork enthusiast from Dhaka, started
                  hand-engraving lighters in a small studio in 2019. Word
                  spread. What began as gifts for friends became a movement.
                </p>
                <p>
                  Every lighter we make carries the soul of its maker. The
                  flame isn&apos;t just functional — it&apos;s a symbol of
                  warmth, creativity, and the spark of human connection.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card-hover">
              <Image
                src="https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=900&q=80"
                alt="A handcrafted brass lighter"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Block 2 — Image left, Text right */}
          <div className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card-hover order-last lg:order-first">
              <Image
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80"
                alt="Handcrafted resin jewelry necklace"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="order-first lg:order-last">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">
                The Craft
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900 mb-6 leading-tight">
                Resin, Metal &amp; Magic
              </h2>
              <div className="font-sans text-base text-charcoal-500 leading-relaxed flex flex-col gap-4">
                <p>
                  Our jewelry and accessories are hand-poured in small batches
                  — never mass-produced. Each resin piece is a miniature
                  painting: layers of pigment, botanicals, and gold leaf
                  suspended in crystal-clear epoxy, then hand-sanded to a
                  glass-like finish.
                </p>
                <p>
                  From delicate necklace pendants to bold statement rings,
                  every piece in our collection starts life as raw materials on
                  a workbench and ends as a wearable work of art.
                </p>
              </div>
            </div>
          </div>

          {/* Block 3 — Text left, Image right */}
          <div className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">
                Our Promise
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900 mb-6 leading-tight">
                Premium Accessories,
                <br />
                Consciously Made
              </h2>
              <div className="font-sans text-base text-charcoal-500 leading-relaxed flex flex-col gap-4">
                <p>
                  Our keychains, phone grips, brooches and home décor pieces
                  are designed to outlast trends. We source sustainably, work
                  in small batches, and believe that slowing down production is
                  the only way to speed up quality.
                </p>
                <p>
                  When you carry a Glideearth piece, you carry a story — of
                  the hands that made it, the hours spent perfecting it, and
                  the care that went into every detail.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-card-hover">
              <Image
                src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80"
                alt="Handcrafted leather keychain accessories"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <div className="bg-beige-100 border-y border-beige-200 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-serif text-3xl text-charcoal-900">
                {stat.value}
              </p>
              <p className="font-sans text-xs uppercase tracking-wider text-charcoal-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Values Section ────────────────────────────────────────────────── */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600 mb-3">
              What We Stand For
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal-900">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-beige-50 border border-beige-200 rounded-2xl p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-500/10 text-terracotta-600 mb-5">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-lg text-charcoal-900 mb-2">
                  {title}
                </h3>
                <p className="font-sans text-sm text-charcoal-500 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dark CTA Section ──────────────────────────────────────────────── */}
      <div className="bg-charcoal-950 py-20 text-center relative overflow-hidden">
        {/* Blob decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-beige-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-noise opacity-60" />
        </div>

        <div className="relative max-w-2xl mx-auto px-6">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-400 mb-3">
            Ready to Own Something Special?
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-cream leading-tight">
            Explore Our Collection
          </h2>
          <p className="font-sans text-base text-beige-200/70 mt-4 max-w-xl mx-auto leading-relaxed">
            Every piece in the Glideearth catalog is waiting to become part of
            your story.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-terracotta-500 px-8 py-4 font-sans text-base font-medium text-cream shadow-glow transition-all duration-300 hover:bg-terracotta-600 active:scale-[0.97]"
          >
            Shop All Products
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
