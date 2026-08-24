import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib";

type IconButtonVariant = "default" | "ghost";
type IconButtonSize = "default" | "compact";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-botanical-soft)] disabled:border-[var(--color-border)] disabled:bg-[var(--color-surface)] disabled:text-[var(--color-text-muted)]",

  ghost:
    "border border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-botanical-soft)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-selection)] disabled:bg-transparent disabled:text-[var(--color-text-muted)]",
};

const sizeClasses: Record<IconButtonSize, string> = {
  default: "size-11",
  compact: "size-9",
};

export function IconButton({
  "aria-label": ariaLabel,
  icon,
  variant = "default",
  size = "default",
  className,
  type = "button",
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-[background-color,border-color,color] duration-[var(--transition-base)] ease-[var(--ease-standard)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}