import type { HTMLAttributes } from "react";

import { cn } from "@/lib";

type BadgeVariant =
  | "neutral"
  | "botanical"
  | "upcoming"
  | "due"
  | "overdue";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]",

  botanical:
    "border-[var(--color-botanical-muted)] bg-[var(--color-botanical-soft)] text-[var(--color-botanical)]",

  upcoming:
    "border-[var(--color-border)] bg-[var(--color-reminder-upcoming)] text-[var(--color-text-secondary)]",

  due:
    "border-[var(--color-border-strong)] bg-[var(--color-reminder-due)] text-[var(--color-text-primary)]",

  overdue:
    "border-[var(--color-border-strong)] bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center border px-2 py-1",
        "rounded-[var(--radius-sm)]",
        "text-[0.6875rem] font-semibold leading-none tracking-[0.08em] uppercase",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}