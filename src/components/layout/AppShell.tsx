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
      <AppHeader navigation={navigation} actions={actions} />

      <main className="mx-auto w-full max-w-[var(--page-max-width)] px-[var(--page-padding-inline)] py-8 sm:py-10 lg:py-12">
        {children}
      </main>
    </div>
  );
}