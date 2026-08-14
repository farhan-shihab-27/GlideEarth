"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, ShoppingBag, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-smooth",
        scrolled
          ? "bg-cream/80 shadow-soft backdrop-blur-lg"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold text-charcoal-900"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-cream shadow-glow">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          Glideearth
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-charcoal-700 transition-colors duration-300 hover:text-terracotta-600 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-terracotta-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <button
            aria-label="Open cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal-800 transition-colors duration-300 hover:bg-beige-100"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-semibold text-cream">
              2
            </span>
          </button>
          <Button href="/shop" size="sm">
            Shop Now
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal-800 lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-cream shadow-soft lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-8 pt-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base font-medium text-charcoal-800 transition-colors hover:bg-beige-100 hover:text-terracotta-600"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 flex items-center gap-3 px-3">
                <Button href="/shop" className="flex-1" onClick={() => setMobileOpen(false)}>
                  Shop Now
                </Button>
                <button
                  aria-label="Open cart"
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-beige-100 text-charcoal-800"
                >
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-terracotta-500 text-[10px] font-semibold text-cream">
                    2
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
