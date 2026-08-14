"use client";

import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

/**
 * Reusable "- N +" quantity stepper. Fully controlled so it can be
 * composed with any parent (cart line items, PDP purchase panel, etc.).
 */
export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-full border border-charcoal-800/15 bg-cream">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-beige-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <span className="w-10 text-center font-serif text-lg text-charcoal-900" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal-700 transition-colors hover:bg-beige-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
