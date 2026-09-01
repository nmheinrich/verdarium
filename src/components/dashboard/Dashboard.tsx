import { useMemo, useState } from "react";

import type { CollectionStorageError } from "@/storage";
import type { Specimen } from "@/types";
import { searchSpecimens } from "@/lib";
import { Surface } from "@/components/ui";

import { CollectionSearch } from "./CollectionSearch";
import { CollectionSummary } from "./CollectionSummary";
import { CompactCollectionView } from "./CompactCollectionView";
import { RecentSpecimens } from "./RecentSpecimens";

interface DashboardProps {
  specimens: Specimen[];
  loadError?: CollectionStorageError | null;
  onSpecimenSelect?: (specimen: Specimen) => void;
}

export function Dashboard({
  specimens,
  loadError = null,
  onSpecimenSelect,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const trimmedSearchQuery = searchQuery.trim();

  const searchResults = useMemo(
    () => searchSpecimens(specimens, searchQuery),
    [specimens, searchQuery],
  );

  if (loadError) {
    return (
      <section
        aria-labelledby="collection-load-error-heading"
        className="mt-8"
      >
        <Surface variant="subtle" className="p-6 sm:p-8">
          <p className="metadata-label">
            Collection unavailable
          </p>

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
          <p className="metadata-label">
            Collection register
          </p>

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

  const isSearchActive = trimmedSearchQuery.length > 0;

  return (
    <div className="mt-8 space-y-6">
      <CollectionSummary specimens={specimens} />

      <CollectionSearch
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {isSearchActive ? (
        searchResults.length > 0 ? (
          <CompactCollectionView
            specimens={searchResults}
            onSpecimenSelect={onSpecimenSelect}
          />
        ) : (
          <section
            aria-labelledby="collection-search-empty-heading"
          >
            <Surface variant="subtle" className="p-6 sm:p-8">
              <p className="metadata-label">
                Archive lookup
              </p>

              <h2
                id="collection-search-empty-heading"
                className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
              >
                No specimens match this search
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Try another common name, scientific name, classification,
                location, tag, or acquisition source.
              </p>
            </Surface>
          </section>
        )
      ) : (
        <RecentSpecimens
          specimens={specimens}
          onSpecimenSelect={onSpecimenSelect}
        />
      )}
    </div>
  );
}