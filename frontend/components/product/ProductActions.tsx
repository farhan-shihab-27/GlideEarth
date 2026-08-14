"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import QuantitySelector from "@/components/product/QuantitySelector";
import Button from "@/components/ui/Button";

type ProductActionsProps = {
  productId: string;
  productName: string;
  stockQuantity: number;
};

const easeSmooth = [0.22, 1, 0.36, 1] as const;

/**
 * Client-side purchase panel: quantity stepper + Add to Cart button with a
 * lightweight confirmation toast. Cart state is not wired up yet — the
 * `console.log` + toast here are an intentional placeholder ahead of the
 * real cart integration in Phase 8.
 */
export default function ProductActions({
  productId,
  productName,
  stockQuantity,
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [toastVisible, setToastVisible] = useState(false);

  const outOfStock = stockQuantity <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;

    // TODO(Phase 8): replace with a real cart mutation (context/store + API call).
    console.log(`[Add to Cart] ${quantity} × "${productName}" (id: ${productId})`);

    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2600);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, stockQuantity)}
        />
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          size="lg"
          className="flex-1 justify-center sm:min-w-[240px] sm:flex-none"
          icon={<ShoppingBag className="h-4 w-4" />}
        >
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>

      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
            className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit items-center gap-3 rounded-full bg-charcoal-900 px-5 py-3 text-sm text-cream shadow-glass"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-terracotta-400" strokeWidth={1.75} />
            <span>
              Added {quantity} × &ldquo;{productName}&rdquo; to your cart.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
