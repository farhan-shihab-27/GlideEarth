import { Ban, CheckCircle2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type StockStatusProps = {
  stockQuantity: number;
  lowStockThreshold: number;
};

export default function StockStatus({ stockQuantity, lowStockThreshold }: StockStatusProps) {
  if (stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-charcoal-400">
        <Ban className="h-4 w-4" strokeWidth={1.75} />
        Out of Stock
      </span>
    );
  }

  const isLowStock = stockQuantity <= lowStockThreshold;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        isLowStock ? "text-terracotta-600" : "text-emerald-700"
      )}
    >
      {isLowStock ? (
        <TriangleAlert className="h-4 w-4" strokeWidth={1.75} />
      ) : (
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
      )}
      {isLowStock
        ? `Low Stock — Only ${stockQuantity} Left`
        : "In Stock — Ready to Ship"}
    </span>
  );
}
