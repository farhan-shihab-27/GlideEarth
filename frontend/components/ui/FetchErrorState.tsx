import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

type FetchErrorStateProps = {
  title?: string;
  description?: string;
  light?: boolean;
};

/**
 * Graceful, on-brand fallback shown when a storefront section fails to
 * load live data from the API — never a blank section or a raw error.
 */
export default function FetchErrorState({
  title = "We're currently updating our catalog.",
  description = "Please check back shortly — our artisans are hard at work.",
  light = false,
}: FetchErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-4xl border border-dashed px-8 py-20 text-center",
        light
          ? "border-beige-100/15 bg-white/5"
          : "border-charcoal-900/10 bg-beige-50/60"
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full",
          light ? "bg-terracotta-400/15 text-terracotta-300" : "bg-terracotta-500/10 text-terracotta-600"
        )}
      >
        <PackageSearch className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h3 className={cn("mt-5 font-serif text-xl", light ? "text-cream" : "text-charcoal-900")}>
        {title}
      </h3>
      <p className={cn("mt-2 max-w-sm text-sm leading-relaxed", light ? "text-beige-200/70" : "text-charcoal-500")}>
        {description}
      </p>
    </div>
  );
}
