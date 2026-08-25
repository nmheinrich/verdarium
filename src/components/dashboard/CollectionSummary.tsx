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
      <Surface className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">Collection register</p>

          <h2
            id="collection-summary-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Botanical archive
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            A concise record of the specimens currently held in your
            collection.
          </p>
        </div>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="bg-[var(--color-surface)] px-5 py-5 sm:px-6"
            >
              <dt className="metadata-label">{item.label}</dt>

              <dd className="mt-3 font-serif text-3xl leading-none text-[var(--color-text-primary)]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Surface>
    </section>
  );
}