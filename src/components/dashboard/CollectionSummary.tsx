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
      <Surface
        variant="subtle"
        className="px-4 py-3 sm:px-5 sm:py-3.5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="metadata-label text-[0.625rem]">
              Collection register
            </p>

            <h2
              id="collection-summary-heading"
              className="mt-1 font-serif text-base leading-tight text-[var(--color-text-primary)] sm:text-lg"
            >
              Botanical archive
            </h2>
          </div>

          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)] sm:justify-end">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="flex items-baseline gap-1.5"
              >
                <dt className="metadata-label text-[0.625rem]">
                  {item.label}
                </dt>

                <dd className="font-serif text-base leading-none text-[var(--color-text-primary)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Surface>
    </section>
  );
}