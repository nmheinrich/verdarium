import type { Specimen } from "@/types";

import { Surface } from "@/components/ui";
import { formatDisplayDate } from "@/lib";

interface RecentSpecimensProps {
  specimens: Specimen[];
}

export function RecentSpecimens({
  specimens,
}: RecentSpecimensProps) {
  const recentSpecimens = [...specimens]
    .sort(
      (firstSpecimen, secondSpecimen) =>
        new Date(secondSpecimen.updatedAt).getTime() -
        new Date(firstSpecimen.updatedAt).getTime(),
    )
    .slice(0, 4);

  return (
    <section aria-labelledby="recent-specimens-heading">
      <Surface className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">Archive index</p>

          <h2
            id="recent-specimens-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Recently updated specimens
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            The most recently revised records in your botanical collection.
          </p>
        </div>

        {recentSpecimens.length > 0 ? (
          <ul className="mt-8 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {recentSpecimens.map((specimen) => {
              const updatedDate = formatDisplayDate(specimen.updatedAt);

              return (
                <li
                  key={specimen.id}
                  className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {specimen.commonName}
                    </p>

                    <p className="scientific-name mt-1 text-base text-[var(--color-text-secondary)]">
                      {specimen.scientificName}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="metadata-label">Last revised</p>

                    <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                      {updatedDate ?? "Date unavailable"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              No specimen records are available yet.
            </p>
          </div>
        )}
      </Surface>
    </section>
  );
}