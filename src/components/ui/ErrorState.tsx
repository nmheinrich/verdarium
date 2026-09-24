import type { ReactNode } from "react";

import { Surface } from "@/components/ui/Surface";

interface ErrorStateProps {
  eyebrow?: string;
  titleId?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function ErrorState({
  eyebrow = "Archive unavailable",
  titleId,
  title,
  description,
  actions,
}: ErrorStateProps) {
  return (
    <Surface
      variant="subtle"
      className="px-6 py-8 sm:px-8 sm:py-10"
    >
      <div className="max-w-2xl">
        <p className="metadata-label">
          {eyebrow}
        </p>

        <h2
          id={titleId}
          className="mt-3 font-display type-title text-[var(--color-text-primary)]"
        >
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>

        {actions ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </Surface>
  );
}