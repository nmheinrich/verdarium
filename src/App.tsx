import { AppShell } from './components/layout';
import { APP_DESCRIPTION, APP_NAME } from './constants';

export default function App() {
  return (
    <AppShell>
      <section className="flex min-h-screen items-center py-16">
        <div className="max-w-2xl">
          <p className="metadata-label mb-4">
            Digital Botanical Collection
          </p>

          <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">
            {APP_NAME}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-text-secondary)]">
            {APP_DESCRIPTION}
          </p>

          <p className="mt-10 scientific-name text-xl text-[var(--color-botanical)]">
            The collection is the hero.
          </p>
        </div>
      </section>
    </AppShell>
  );
}