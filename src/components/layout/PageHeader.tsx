import type { ReactNode } from "react";

import { cn } from "@/lib";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? <p className="metadata-label">{eyebrow}</p> : null}

        <h1
          className={cn(
            "font-serif text-3xl leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}