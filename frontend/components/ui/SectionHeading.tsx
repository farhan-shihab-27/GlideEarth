import Reveal from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <span
            className={cn(
              "mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]",
              light ? "text-terracotta-300" : "text-terracotta-600"
            )}
          >
            <span className="h-px w-6 bg-current" />
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "text-balance font-serif text-3xl leading-tight sm:text-4xl md:text-[2.75rem]",
            light ? "text-cream" : "text-charcoal-900"
          )}
        >
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p
            className={cn(
              "mt-4 text-balance text-base leading-relaxed",
              light ? "text-beige-200/80" : "text-charcoal-500"
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
