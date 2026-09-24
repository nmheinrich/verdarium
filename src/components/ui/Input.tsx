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
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3.5 text-sm leading-5 text-[var(--color-text-primary)] shadow-[var(--shadow-control)] outline-none",
        "transition-[border-color,box-shadow] duration-[160ms] ease-[var(--ease-standard)]",
        "placeholder:text-[var(--color-text-muted)]",
        "enabled:hover:border-[var(--color-text-muted)]",
        "focus:border-[var(--color-botanical)] focus:shadow-[0_0_0_3px_var(--color-botanical-soft)] enabled:focus:border-[var(--color-botanical)]",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none",
        invalid &&
          "border-[var(--color-reminder-overdue-ink)] focus:border-[var(--color-reminder-overdue-ink)] focus:shadow-[0_0_0_3px_var(--color-reminder-overdue)] enabled:hover:border-[var(--color-reminder-overdue-ink)]",
        className,
      )}
      {...props}
    />
  );
}
