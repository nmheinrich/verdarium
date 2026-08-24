import type { ReactNode } from "react";

import { cn } from "@/lib";

interface AppHeaderProps {
  navigation?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

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
        <div className="flex min-h-20 items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="font-serif text-xl leading-none tracking-tight text-[var(--color-text-primary)]">
              Verdarium
            </p>

            <p className="metadata-label mt-1.5 truncate">
              Botanical Archive
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