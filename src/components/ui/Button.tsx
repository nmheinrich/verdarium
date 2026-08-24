import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "compact";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--color-botanical)] bg-[var(--color-botanical-soft)] text-[color:var(--color-text-on-botanical)] hover:brightness-95 active:brightness-90 disabled:border-[var(--color-border)] disabled:bg-[var(--color-border)] disabled:text-[color:var(--color-text-muted)]",

  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[color:var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] active:bg-[var(--color-botanical-soft)] disabled:border-[var(--color-border)] disabled:bg-[var(--color-surface)] disabled:text-[color:var(--color-text-muted)]",

  ghost:
    "border border-transparent bg-transparent text-[color:var(--color-text-secondary)] hover:bg-[var(--color-botanical-soft)] hover:text-[color:var(--color-text-primary)] active:bg-[var(--color-selection)] disabled:bg-transparent disabled:text-[color:var(--color-text-muted)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "min-h-11 px-4 py-2.5 text-sm",
  compact: "min-h-9 px-3 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "default",
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium leading-none transition-[background-color,border-color,color,filter] duration-[var(--transition-base)] ease-[var(--ease-standard)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {leadingIcon}
        </span>
      ) : null}

      <span>{children}</span>

      {trailingIcon ? (
        <span aria-hidden="true" className="shrink-0">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
}