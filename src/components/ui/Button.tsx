import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib";

type ButtonVariant = "primary" | "secondary" | "tonal" | "ghost";

// "default" and "compact" are the original size names and map to md and sm.
type ButtonSize = "sm" | "md" | "lg" | "default" | "compact";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--color-botanical)] text-[var(--color-text-on-botanical)] shadow-[var(--shadow-control)] enabled:hover:bg-[var(--color-botanical-hover)]",
  secondary:
    "border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-[var(--shadow-control)] enabled:hover:border-[var(--color-botanical-muted)] enabled:hover:bg-[var(--color-surface)]",
  tonal:
    "border-transparent bg-[var(--color-botanical-soft)] text-[var(--color-botanical)] enabled:hover:bg-[var(--color-selection)]",
  ghost:
    "border-transparent bg-transparent text-[var(--color-text-secondary)] enabled:hover:bg-[var(--color-botanical-soft)] enabled:hover:text-[var(--color-text-primary)] enabled:active:bg-[var(--color-selection)]",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8 gap-1.5 px-3 text-[0.8125rem] [&_svg]:size-3.5",
  md: "h-10 gap-2 px-[1.125rem] text-sm [&_svg]:size-4",
  lg: "h-12 gap-2 px-6 text-[0.9375rem] [&_svg]:size-4",
};

function normalizeSize(size: ButtonSize): "sm" | "md" | "lg" {
  if (size === "compact") return "sm";
  if (size === "default") return "md";
  return size;
}

export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  loading = false,
  block = false,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] border font-medium leading-none tracking-[0.005em]",
        "transition-[background-color,border-color,color,box-shadow,transform] duration-[160ms] ease-[var(--ease-standard)]",
        "enabled:active:translate-y-[0.5px] enabled:active:scale-[0.985]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none",
        loading && "cursor-progress",
        variantClasses[variant],
        sizeClasses[normalizeSize(size)],
        block && "flex w-full",
        className,
      )}
      {...props}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className={cn("inline-flex shrink-0", loading && "invisible")}>
          {leadingIcon}
        </span>
      ) : null}
      <span className={cn(loading && "invisible")}>{children}</span>
      {trailingIcon ? (
        <span aria-hidden="true" className={cn("inline-flex shrink-0", loading && "invisible")}>
          {trailingIcon}
        </span>
      ) : null}
      {loading ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto size-4 animate-spin rounded-full border-[1.5px] border-current border-r-transparent"
        />
      ) : null}
    </button>
  );
}
