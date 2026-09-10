import type { ReactNode } from "react";

import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
}

export function AppShell({
  children,
  navigation,
  actions,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-sm transition-transform duration-[var(--transition-base)] focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <AppHeader
        navigation={navigation}
        actions={actions}
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-[var(--page-max-width)] px-[var(--page-padding-inline)] py-8 sm:py-10 lg:py-12"
      >
        {children}
      </main>
    </div>
  );
}