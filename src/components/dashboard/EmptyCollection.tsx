import { Plus } from "lucide-react";

import { Surface } from "@/components/ui";

interface EmptyCollectionProps {
  onAddSpecimen?: () => void;
}

export function EmptyCollection({
  onAddSpecimen,
}: EmptyCollectionProps) {
  return (
    <section
      aria-labelledby="empty-collection-heading"
      className="mt-8"
    >
      <Surface className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="metadata-label">
              Collection register
            </p>

            <h2
              id="empty-collection-heading"
              className="mt-3 max-w-xl font-serif text-3xl leading-tight text-[var(--color-text-primary)] sm:text-4xl"
            >
              Begin your botanical archive
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
              Verdarium keeps each plant as a specimen record—a quiet place
              for botanical identity, provenance, condition, location, and
              care.
            </p>

            {onAddSpecimen ? (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={onAddSpecimen}
                  className="group inline-flex items-center gap-2 font-serif text-xl text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] sm:text-2xl"
                >
                  <Plus
                    size={18}
                    aria-hidden="true"
                    className="text-[var(--color-text-muted)]"
                  />

                  <span className="underline-offset-4 group-hover:underline group-focus-visible:underline">
                    Add first specimen
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex min-h-52 items-center justify-center border-t border-[var(--color-border)] bg-[var(--color-surface)] p-8 lg:border-l lg:border-t-0">
            <div className="flex flex-col items-center text-center">
              <p className="metadata-label">
                First specimen plate
              </p>

              <div
                aria-hidden="true"
                className="mt-6 h-20 w-px bg-[var(--color-border-strong)]"
              />

              <p className="mt-5 max-w-40 text-xs leading-5 text-[var(--color-text-muted)]">
                Awaiting the first botanical record
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </section>
  );
}