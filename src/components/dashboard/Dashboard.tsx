import type { CollectionStorageError } from "@/storage";
import type { Specimen } from "@/types";

import { Surface } from "@/components/ui";

import { CollectionSummary } from "./CollectionSummary";
import { RecentSpecimens } from "./RecentSpecimens";

interface DashboardProps {
  specimens: Specimen[];
  loadError?: CollectionStorageError | null;
}

export function Dashboard({
  specimens,
  loadError = null,
}: DashboardProps) {
  if (loadError) {
    return (
      <section
        aria-labelledby="collection-load-error-heading"
        className="mt-8"
      >
        <Surface variant="subtle" className="p-6 sm:p-8">
          <p className="metadata-label">Collection unavailable</p>

          <h2
            id="collection-load-error-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            The botanical archive could not be loaded
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            Your stored collection remains unchanged. Verdarium was unable to
            safely read the existing archive data.
          </p>

          <p className="mt-5 text-sm leading-6 text-[var(--color-text-muted)]">
            {loadError.message}
          </p>
        </Surface>
      </section>
    );
  }

  if (specimens.length === 0) {
    return (
      <section
        aria-labelledby="empty-collection-heading"
        className="mt-8"
      >
        <Surface className="p-6 sm:p-8">
          <p className="metadata-label">Collection register</p>

          <h2
            id="empty-collection-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Your botanical archive is empty
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            Specimens will appear here as they are added to your personal
            herbarium.
          </p>
        </Surface>
      </section>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <CollectionSummary specimens={specimens} />

      <RecentSpecimens specimens={specimens} />
    </div>
  );
}