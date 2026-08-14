export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export type Category = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  image: string;
  href: string;
  size: "large" | "small";
};

export const categories: Category[] = [
  {
    id: "custom-lighters",
    name: "Custom Lighters",
    description: "Hand-engraved flame lighters, personalized just for you.",
    itemCount: 24,
    image:
      "https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=1400&q=80",
    href: "/shop/lighters",
    size: "large",
  },
  {
    id: "resin-jewelry",
    name: "Resin Jewelry",
    description: "One-of-a-kind rings, pendants & earrings cast by hand.",
    itemCount: 58,
    image:
      "https://images.unsplash.com/photo-1745192904087-dd0e68d8a6b5?auto=format&fit=crop&w=1200&q=80",
    href: "/shop/jewelry",
    size: "small",
  },
  {
    id: "keychains",
    name: "Keychains",
    description: "Leather & metal keychains crafted to carry your story.",
    itemCount: 36,
    image:
      "https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?auto=format&fit=crop&w=1200&q=80",
    href: "/shop/keychains",
    size: "small",
  },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  badge?: string;
  href: string;
};

export const latestArrivals: Product[] = [
  {
    id: "flame-vintage-lighter",
    name: "Flame Vintage Lighter",
    category: "Custom Lighters",
    price: 34.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1741195355990-5f75d937815e?auto=format&fit=crop&w=900&q=80",
    badge: "Bestseller",
    href: "/product/flame-vintage-lighter",
  },
  {
    id: "ocean-resin-pendant",
    name: "Ocean Wave Resin Pendant",
    category: "Resin Jewelry",
    price: 28.5,
    originalPrice: 36,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1614367989578-40d097412e2b?auto=format&fit=crop&w=900&q=80",
    badge: "New",
    href: "/product/ocean-resin-pendant",
  },
  {
    id: "heart-charm-keychain",
    name: "Heart Charm Keychain",
    category: "Keychains",
    price: 16,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1727154085760-134cc942246e?auto=format&fit=crop&w=900&q=80",
    href: "/product/heart-charm-keychain",
  },
  {
    id: "rainbow-resin-ring",
    name: "Rainbow Resin Statement Ring",
    category: "Resin Jewelry",
    price: 22,
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1515168746408-0f924dbb5c39?auto=format&fit=crop&w=900&q=80",
    badge: "New",
    href: "/product/rainbow-resin-ring",
  },
];
