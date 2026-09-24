import type { ReactNode } from "react";

import { cn } from "@/lib";

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** The app header (design system: AppNav): wordmark, actions and primary views. */
export function AppHeader({
  navigation,
  actions,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-[var(--color-border)] bg-[var(--color-surface)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[var(--page-max-width)] flex-col px-[var(--page-padding-inline)]">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="font-display text-2xl leading-none tracking-[0.03em] text-[var(--color-text-primary)]">
              Verdarium
            </p>
            <p className="metadata-label truncate">
              Botanical archive
            </p>
          </div>

          {actions ? (
            <div className="flex shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>

        {navigation ? <div>{navigation}</div> : null}
      </div>
    </header>
  );
}
