import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  muted?: boolean;
}

export function Label({
  muted = false,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "metadata-label inline-block",
        muted && "text-[var(--color-text-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}