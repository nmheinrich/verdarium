import type { Specimen } from "@/types";

import { Surface } from "@/components/ui";
import { formatDisplayDate } from "@/lib";

interface RecentSpecimensProps {
  specimens: Specimen[];
  onSpecimenSelect?: (specimen: Specimen) => void;
}

export function RecentSpecimens({
  specimens,
  onSpecimenSelect,
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

              const content = (
                <div className="grid w-full gap-3 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] underline-offset-4 transition-[text-decoration-color] duration-[var(--transition-base)] group-hover:underline group-focus-visible:underline">
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
                </div>
              );

              return (
                <li key={specimen.id}>
                  {onSpecimenSelect ? (
                    <button
                      type="button"
                      className="group w-full py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]"
                      onClick={() =>
                        onSpecimenSelect(specimen)
                      }
                      aria-label={`Open ${specimen.commonName} specimen record`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="py-5">
                      {content}
                    </div>
                  )}
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