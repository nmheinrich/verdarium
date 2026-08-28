import type { Specimen } from "@/types";

import { Surface } from "@/components/ui";

interface CollectionSummaryProps {
  specimens: Specimen[];
}

interface SummaryItem {
  label: string;
  value: number;
}

export function CollectionSummary({
  specimens,
}: CollectionSummaryProps) {
  const favoriteCount = specimens.filter(
    (specimen) => specimen.isFavorite,
  ).length;

  const reminderCount = specimens.filter(
    (specimen) => specimen.reminder?.enabled,
  ).length;

  const summaryItems: SummaryItem[] = [
    {
      label: "Specimens",
      value: specimens.length,
    },
    {
      label: "Favorites",
      value: favoriteCount,
    },
    {
      label: "Care reminders",
      value: reminderCount,
    },
  ];

  return (
    <section aria-labelledby="collection-summary-heading">
      <Surface className="p-5 sm:p-6">
        <div className="max-w-2xl">
          <p className="metadata-label text-[0.625rem]">
            Collection register
          </p>

          <h2
            id="collection-summary-heading"
            className="mt-2 font-serif text-lg leading-tight text-[var(--color-text-primary)]"
          >
            Botanical archive
          </h2>

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)] sm:text-sm sm:leading-6">
            A concise record of the specimens currently held in your
            collection.
          </p>
        </div>

        <dl className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="bg-[var(--color-surface)] px-4 py-4 sm:px-5"
            >
              <dt className="metadata-label text-[0.625rem]">
                {item.label}
              </dt>

              <dd className="mt-2 font-serif text-xl leading-none text-[var(--color-text-primary)]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Surface>
    </section>
  );
}