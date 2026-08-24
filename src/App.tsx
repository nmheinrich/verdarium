import {
  ArrowRight,
  Edit3,
  Leaf,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/layout";
import {
  Badge,
  Button,
  IconButton,
  Input,
  Label,
  Surface,
} from "@/components/ui";

export default function App() {
  return (
    <AppShell>
      <div className="py-8 sm:py-12">
        <header className="max-w-3xl">
          <p className="metadata-label">Verdarium / Design System</p>

          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
            Botanical Design System
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
            A restrained visual language for a digital botanical archive,
            grounded in museum collections, scientific notation, and quiet
            editorial design.
          </p>
        </header>

        <main className="mt-12 space-y-12">
          <section aria-labelledby="typography-heading">
            <div className="mb-5">
              <p className="metadata-label">01 / Typography</p>

              <h2
                id="typography-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Archive hierarchy
              </h2>
            </div>

            <Surface className="p-6 sm:p-8">
              <div className="space-y-8">
                <div>
                  <p className="metadata-label">Editorial title</p>

                  <p className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)] sm:text-4xl">
                    The cultivated archive
                  </p>
                </div>

                <div>
                  <p className="metadata-label">Body text</p>

                  <p className="mt-3 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
                    Verdarium treats each plant as a collected specimen rather
                    than an item in a task list. Information should feel
                    considered, legible, and quietly permanent.
                  </p>
                </div>

                <div>
                  <p className="metadata-label">Scientific nomenclature</p>

                  <p className="scientific-name mt-3 text-2xl text-[var(--color-text-primary)]">
                    Monstera deliciosa
                  </p>
                </div>

                <div>
                  <p className="metadata-label">Archive metadata</p>

                  <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                    Accession 0042 · Araceae · Central America
                  </p>
                </div>
              </div>
            </Surface>
          </section>

          <section aria-labelledby="surfaces-heading">
            <div className="mb-5">
              <p className="metadata-label">02 / Surfaces</p>

              <h2
                id="surfaces-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Archival layers
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Surface className="p-6">
                <p className="metadata-label">Default</p>

                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  The standard surface for grouped archival content.
                </p>
              </Surface>

              <Surface variant="elevated" className="p-6">
                <p className="metadata-label">Elevated</p>

                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  A slightly more pronounced layer for important contained
                  material.
                </p>
              </Surface>

              <Surface variant="subtle" className="p-6">
                <p className="metadata-label">Subtle</p>

                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  A quiet structural region with minimal visual elevation.
                </p>
              </Surface>
            </div>
          </section>

          <section aria-labelledby="buttons-heading">
            <div className="mb-5">
              <p className="metadata-label">03 / Controls</p>

              <h2
                id="buttons-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Buttons and actions
              </h2>
            </div>

            <Surface className="p-6 sm:p-8">
              <div className="space-y-8">
                <div>
                  <Label>Button variants</Label>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button leadingIcon={<Leaf size={16} />}>
                      Add specimen
                    </Button>

                    <Button
                      variant="secondary"
                      trailingIcon={<ArrowRight size={16} />}
                    >
                      View collection
                    </Button>

                    <Button variant="ghost">Cancel</Button>

                    <Button disabled>Unavailable</Button>
                  </div>
                </div>

                <div>
                  <Label>Compact controls</Label>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button size="compact" variant="secondary">
                      Compact action
                    </Button>

                    <IconButton
                      aria-label="Edit specimen"
                      icon={<Edit3 size={17} />}
                    />

                    <IconButton
                      aria-label="More options"
                      icon={<MoreHorizontal size={18} />}
                      variant="ghost"
                    />
                  </div>
                </div>
              </div>
            </Surface>
          </section>

          <section aria-labelledby="forms-heading">
            <div className="mb-5">
              <p className="metadata-label">04 / Forms</p>

              <h2
                id="forms-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Field treatment
              </h2>
            </div>

            <Surface className="max-w-2xl p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="specimen-name">Specimen name</Label>

                  <Input
                    id="specimen-name"
                    className="mt-2"
                    placeholder="e.g. Monstera deliciosa"
                  />
                </div>

                <div>
                  <Label htmlFor="archive-search">Archive search</Label>

                  <div className="relative mt-2">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                      size={16}
                    />

                    <Input
                      id="archive-search"
                      className="pl-9"
                      placeholder="Search collection"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="invalid-field">Invalid example</Label>

                  <Input
                    id="invalid-field"
                    className="mt-2"
                    invalid
                    defaultValue="Unknown specimen"
                  />

                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    This field demonstrates the restrained invalid-state
                    treatment.
                  </p>
                </div>

                <div>
                  <Label htmlFor="disabled-field" muted>
                    Disabled example
                  </Label>

                  <Input
                    id="disabled-field"
                    className="mt-2"
                    disabled
                    defaultValue="Archived record"
                  />
                </div>
              </div>
            </Surface>
          </section>

          <section aria-labelledby="badges-heading">
            <div className="mb-5">
              <p className="metadata-label">05 / Metadata</p>

              <h2
                id="badges-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Badges and status markers
              </h2>
            </div>

            <Surface className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <Badge>Collection</Badge>
                <Badge variant="botanical">Araceae</Badge>
                <Badge variant="upcoming">Upcoming</Badge>
                <Badge variant="due">Due today</Badge>
                <Badge variant="overdue">Overdue</Badge>
              </div>
            </Surface>
          </section>

          <section aria-labelledby="specimen-preview-heading">
            <div className="mb-5">
              <p className="metadata-label">06 / Composition test</p>

              <h2
                id="specimen-preview-heading"
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]"
              >
                Primitive composition
              </h2>
            </div>

            <Surface
              variant="elevated"
              className="archive-surface specimen-border max-w-2xl p-6 sm:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="metadata-label">Specimen study</p>

                  <h3 className="scientific-name mt-3 text-3xl text-[var(--color-text-primary)]">
                    Ficus elastica
                  </h3>

                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Moraceae · Southeast Asia
                  </p>
                </div>

                <IconButton
                  aria-label="More specimen options"
                  icon={<MoreHorizontal size={18} />}
                  variant="ghost"
                />
              </div>

              <div className="mt-8 border-t border-[var(--color-border)] pt-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="botanical">Indoor</Badge>
                  <Badge variant="upcoming">Water in 4 days</Badge>
                </div>
              </div>
            </Surface>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              This is only a composition test for the design-system primitives.
              It is not the future specimen-card implementation.
            </p>
          </section>
        </main>
      </div>
    </AppShell>
  );
}