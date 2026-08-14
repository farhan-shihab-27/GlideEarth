"use client";

import { Mail, Send } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function NewsletterBanner() {
  return (
    <section className="relative bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-terracotta-500 px-8 py-14 text-center shadow-glow sm:px-16">
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-30" />
            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-cream">
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-balance font-serif text-2xl text-cream sm:text-3xl">
                Get 10% Off Your First Order
              </h3>
              <p className="mt-3 text-balance text-sm leading-relaxed text-beige-100/85">
                Join our newsletter for early access to new drops, artisan
                stories, and exclusive discounts.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-cream placeholder:text-beige-100/60 outline-none transition-colors focus:border-white/50"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal-900 px-6 py-3 text-sm font-medium text-cream transition-colors duration-300 hover:bg-charcoal-800"
                >
                  Subscribe
                  <Send className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
