import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({
  invalid = false,
  className,
  disabled,
  ...props
}: InputProps) {
  return (
    <input
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(
        "min-h-11 w-full rounded-[var(--radius-sm)] border bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] shadow-none transition-[background-color,border-color,color] duration-[var(--transition-base)] ease-[var(--ease-standard)]",
        "border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]",
        "hover:border-[var(--color-border-strong)]",
        "focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        "disabled:cursor-not-allowed disabled:bg-[var(--color-background)] disabled:text-[var(--color-text-muted)] disabled:opacity-70",
        invalid &&
          "border-[var(--color-reminder-overdue)] focus-visible:border-[var(--color-reminder-overdue)]",
        className,
      )}
      {...props}
    />
  );
}