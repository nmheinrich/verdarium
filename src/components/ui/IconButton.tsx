import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib";

// "default" is the original name for the raised, bordered variant.
type IconButtonVariant = "ghost" | "secondary" | "default";

// "default" and "compact" are the original size names and map to md and sm.
type IconButtonSize = "sm" | "md" | "default" | "compact";

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  "aria-label": ariaLabel,
  icon,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  disabled,
  title,
  ...props
}: IconButtonProps) {
  const isSmall = size === "sm" || size === "compact";
  const isRaised = variant === "secondary" || variant === "default";

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-transparent bg-transparent text-[var(--color-text-secondary)]",
        "transition-[background-color,border-color,color,transform] duration-[160ms] ease-[var(--ease-standard)]",
        "enabled:hover:bg-[var(--color-botanical-soft)] enabled:hover:text-[var(--color-text-primary)] enabled:active:translate-y-[0.5px] enabled:active:scale-[0.985]",
        "aria-pressed:bg-[var(--color-botanical-soft)] aria-pressed:text-[var(--color-botanical)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        isRaised &&
          "border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-control)] enabled:hover:border-[var(--color-botanical-muted)] enabled:hover:bg-[var(--color-surface)]",
        isSmall ? "size-8 [&_svg]:size-4" : "size-10 [&_svg]:size-[1.125rem]",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </button>
  );
}
