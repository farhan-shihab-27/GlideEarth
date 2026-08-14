import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
};

type ButtonAsLink = BaseProps & {
  href: string;
  onClick?: () => void;
  type?: never;
};

type ButtonAsButton = BaseProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
};

type ButtonProps = ButtonAsLink | ButtonAsButton;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta-500 text-cream hover:bg-terracotta-600 shadow-glow hover:shadow-none",
  outline:
    "border border-charcoal-800/15 text-charcoal-800 hover:border-terracotta-500 hover:text-terracotta-600 bg-transparent",
  ghost: "text-charcoal-800 hover:text-terracotta-600 bg-transparent",
  dark: "bg-charcoal-900 text-cream hover:bg-charcoal-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3.5 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  href,
  onClick,
  type = "button" as "button" | "submit" | undefined,
  variant = "primary",
  size = "md",
  className,
  children,
  icon,
  iconPosition = "right",
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 ease-smooth active:scale-[0.97]",
    variantStyles[variant],
    sizeStyles[size],
    disabled && "pointer-events-none opacity-50 active:scale-100",
    className
  );

  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={classes} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}
