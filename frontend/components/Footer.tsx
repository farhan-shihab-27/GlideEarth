import Link from "next/link";
import { AtSign, Mail, MapPin, Phone, Rss, Share2, Sparkles } from "lucide-react";
import { navLinks } from "@/lib/data";

const shopLinks = [
  { label: "Custom Lighters", href: "/shop/lighters" },
  { label: "Resin Jewelry", href: "/shop/jewelry" },
  { label: "Keychains", href: "/shop/keychains" },
  { label: "Gift Sets", href: "/shop/gift-sets" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal-950 text-beige-200">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-500 text-cream">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              Glideearth
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-beige-300/70">
              Bespoke, handcrafted lighters, resin jewelry & keychains — every
              piece made to carry your story with warmth and character.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[AtSign, Rss, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-beige-100/10 text-beige-200 transition-all duration-300 hover:border-terracotta-400 hover:bg-terracotta-500 hover:text-cream"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base text-cream">Navigate</h4>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-beige-300/70 transition-colors hover:text-terracotta-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base text-cream">Shop</h4>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-beige-300/70 transition-colors hover:text-terracotta-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base text-cream">Get In Touch</h4>
            <ul className="mt-5 space-y-3 text-sm text-beige-300/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-400" />
                123 Artisan Lane, Craft District
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-terracotta-400" />
                hello@glideearth.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-terracotta-400" />
                +1 (555) 012-3456
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-beige-100/10 pt-8 text-xs text-beige-300/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Glideearth. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-terracotta-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-terracotta-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
