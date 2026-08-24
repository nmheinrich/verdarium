import type { HTMLAttributes } from "react";

import { cn } from "@/lib";

type SurfaceVariant = "default" | "elevated" | "subtle";

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
}

const variantClasses: Record<SurfaceVariant, string> = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-subtle)]",

  elevated:
    "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-elevated)]",

  subtle:
    "border border-[var(--color-border)] bg-[var(--color-background)] shadow-none",
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
        "rounded-[var(--radius-md)]",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}