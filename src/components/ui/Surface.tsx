import type { HTMLAttributes } from "react";

import { cn } from "@/lib";

type SurfaceVariant = "default" | "elevated" | "subtle";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
}

const variantClasses: Record<SurfaceVariant, string> = {
  default:
    "rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)]",
  elevated:
    "rounded-[var(--radius-xl)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-elevated)]",
  subtle:
    "rounded-[var(--radius-lg)] bg-[var(--color-background)] shadow-none",
};

export function Surface({
  variant = "default",
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "border border-[var(--color-border)] text-[var(--color-text-primary)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
