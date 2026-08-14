import { cn } from "@/lib/utils";

/**
 * A shimmering placeholder block used while live data streams in from the
 * API. Sized via `className` to match the exact dimensions of the content
 * it stands in for, so nothing jumps when the real content swaps in.
 */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-3xl bg-gradient-to-r from-beige-200 via-beige-100 to-beige-200 bg-[length:200%_100%]",
        className
      )}
    />
  );
}
