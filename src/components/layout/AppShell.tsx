import type { PropsWithChildren } from 'react';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <main
        className="mx-auto w-full"
        style={{
          maxWidth: 'var(--page-max-width)',
          paddingInline: 'var(--page-padding-inline)',
        }}
      >
        {children}
      </main>
    </div>
  );
}