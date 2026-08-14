# Glideearth — Frontend

The Phase 5 frontend for **Glideearth**, an e-commerce storefront for bespoke,
handcrafted lighters, resin jewelry, and keychains. Built for a premium,
buttery-smooth shopping experience.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com) with a custom
  earthy design system (beige / terracotta / charcoal)
- **Animation:** [Framer Motion](https://motion.dev) for scroll reveals,
  hover states, and micro-interactions
- **Icons:** [Lucide React](https://lucide.dev)
- **Language:** TypeScript

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
  layout.tsx          Root layout — fonts, Navbar, Footer, metadata
  page.tsx             Landing page composition
  globals.css          Tailwind directives + global base styles
components/
  Navbar.tsx           Sticky/responsive navbar with mobile menu & cart badge
  Footer.tsx           Site footer
  Hero.tsx             Landing page hero section
  FeaturedCategories.tsx  "Shop by Category" bento grid
  LatestArrivals.tsx   Newest product cards on a dark showcase band
  NewsletterBanner.tsx Email capture CTA band
  ui/
    Button.tsx         Reusable CTA button (link or button element)
    Reveal.tsx          Scroll-triggered fade/slide-in wrapper (Framer Motion)
    SectionHeading.tsx  Eyebrow + serif heading + description block
lib/
  data.ts              Mock categories, products & nav links
  utils.ts             `cn()` class merge helper + price formatter
```

## Design System

Defined in `tailwind.config.js`:

- **Colors:** `beige`, `terracotta`, `charcoal` scales (50–950), plus `cream`
- **Fonts:** Playfair Display (`font-serif`, headings) & Inter
  (`font-sans`, body/UI) — loaded via `next/font/google` in `app/layout.tsx`
- **Shadows:** `shadow-soft`, `shadow-card`, `shadow-card-hover`,
  `shadow-glass`, `shadow-glow`
- **Motion:** `animate-float`, `animate-float-slow`, `animate-blob` keyframes
  for ambient hero decoration

## Notes

- All product/category imagery currently points to royalty-free Unsplash
  photos as placeholders — swap `lib/data.ts` image URLs for real product
  photography once available.
- All UI copy is written in English per project requirements.
