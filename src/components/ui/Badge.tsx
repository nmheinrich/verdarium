import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib";

type BadgeVariant =
  | "neutral"
  | "botanical"
  | "upcoming"
  | "due"
  | "overdue";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Leading status dot. Defaults on for the three reminder states. */
  dot?: boolean;
  /** A small outline icon before the text; replaces the dot. */
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
  botanical:
    "bg-[var(--color-botanical-soft)] text-[var(--color-botanical)]",
  upcoming:
    "bg-[var(--color-reminder-upcoming)] text-[var(--color-text-primary)]",
  due: "bg-[var(--color-reminder-due)] text-[var(--color-text-primary)]",
  overdue:
    "bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-current",
  botanical: "bg-current",
  upcoming: "bg-[var(--color-botanical)]",
  due: "bg-[var(--color-reminder-due-ink)]",
  overdue: "bg-[var(--color-reminder-overdue-ink)]",
};

export function Badge({
  variant = "neutral",
  dot,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const showDot =
    !icon &&
    (dot ??
      (variant === "upcoming" ||
        variant === "due" ||
        variant === "overdue"));

  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border border-transparent px-2.5",
        "text-xs font-medium leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="-ml-0.5 inline-flex shrink-0 text-[var(--color-botanical)] [&_svg]:size-[0.8125rem]"
        >
          {icon}
        </span>
      ) : null}
      {showDot ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-[var(--radius-full)]",
            dotClasses[variant],
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
