import { Plus } from "lucide-react";

import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import { Button, Surface } from "@/components/ui";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Reminders", value: "reminders" },
  { label: "Settings", value: "settings" },
];

export default function App() {
  return (
    <AppShell
      navigation={
        <AppNav
          items={navigationItems}
          activeItem="collection"
        />
      }
      actions={
        <Button
          size="compact"
          leadingIcon={<Plus size={16} />}
        >
          Add specimen
        </Button>
      }
    >
      <PageHeader
        eyebrow="Personal Herbarium"
        title="Collection"
        description="A quiet archive for documenting, studying, and caring for your botanical specimens."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section
          aria-labelledby="collection-preview-heading"
          className="min-w-0"
        >
          <Surface className="p-6 sm:p-8">
            <p className="metadata-label">Archive preview</p>

            <h2
              id="collection-preview-heading"
              className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
            >
              Botanical records will live here
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
              This temporary region verifies the primary content column,
              page spacing, and responsive structure. The actual collection
              and specimen-card interfaces will be introduced in later
              features.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="archive-surface specimen-border min-h-40 rounded-[var(--radius-md)] p-5">
                <p className="metadata-label">Specimen region</p>

                <p className="scientific-name mt-3 text-xl text-[var(--color-text-primary)]">
                  Future botanical record
                </p>
              </div>

              <div className="archive-surface specimen-border min-h-40 rounded-[var(--radius-md)] p-5">
                <p className="metadata-label">Specimen region</p>

                <p className="scientific-name mt-3 text-xl text-[var(--color-text-primary)]">
                  Future botanical record
                </p>
              </div>
            </div>
          </Surface>
        </section>

        <aside aria-labelledby="archive-notes-heading">
          <Surface variant="subtle" className="p-6">
            <p className="metadata-label">Archive notes</p>

            <h2
              id="archive-notes-heading"
              className="mt-3 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
            >
              Layout verification
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              This secondary region verifies that Verdarium can support quiet
              supporting information without competing with the collection.
            </p>

            <dl className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-5">
              <div>
                <dt className="metadata-label">Primary region</dt>
                <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Collection content
                </dd>
              </div>

              <div>
                <dt className="metadata-label">Secondary region</dt>
                <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Supporting archive information
                </dd>
              </div>

              <div>
                <dt className="metadata-label">Responsive behavior</dt>
                <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  Stacked on narrow screens
                </dd>
              </div>
            </dl>
          </Surface>
        </aside>
      </div>
    </AppShell>
  );
}