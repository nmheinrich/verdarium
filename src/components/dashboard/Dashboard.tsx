import { useMemo, useState } from "react";

import type { CollectionStorageError } from "@/storage";
import type { Specimen } from "@/types";
import {
  countActiveSpecimenFilters,
  DEFAULT_SPECIMEN_FILTERS,
  DEFAULT_SPECIMEN_SORT,
  filterSpecimens,
  searchSpecimens,
  sortSpecimens,
} from "@/lib";
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

  const [filters, setFilters] = useState(
    DEFAULT_SPECIMEN_FILTERS,
  );

  const [sortOption, setSortOption] = useState(
    DEFAULT_SPECIMEN_SORT,
  );

  const trimmedSearchQuery = searchQuery.trim();

  const activeFilterCount =
    countActiveSpecimenFilters(filters);

  const isSortActive =
    sortOption !== DEFAULT_SPECIMEN_SORT;

  const activeToolCount =
    activeFilterCount +
    (trimmedSearchQuery.length > 0 ? 1 : 0) +
    (isSortActive ? 1 : 0);

  const visibleSpecimens = useMemo(() => {
    const searchedSpecimens = searchSpecimens(
      specimens,
      searchQuery,
    );

    const filteredSpecimens = filterSpecimens(
      searchedSpecimens,
      filters,
    );

    return sortSpecimens(
      filteredSpecimens,
      sortOption,
    );
  }, [
    specimens,
    searchQuery,
    filters,
    sortOption,
  ]);

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

  const isSearchActive =
    trimmedSearchQuery.length > 0;

  const areFiltersActive =
    activeFilterCount > 0;

  const areCollectionToolsActive =
    isSearchActive ||
    areFiltersActive ||
    isSortActive;

  return (
    <div className="mt-8 space-y-6">
      <CollectionSummary specimens={specimens} />

      <CollectionSearch
        value={searchQuery}
        filters={filters}
        sortOption={sortOption}
        activeCount={activeToolCount}
        onChange={setSearchQuery}
        onFiltersChange={setFilters}
        onSortChange={setSortOption}
      />

      {areCollectionToolsActive ? (
        visibleSpecimens.length > 0 ? (
          <CompactCollectionView
            specimens={visibleSpecimens}
            onSpecimenSelect={onSpecimenSelect}
          />
        ) : (
          <section
            aria-labelledby="collection-tools-empty-heading"
          >
            <Surface variant="subtle" className="p-6 sm:p-8">
              <p className="metadata-label">
                Collection index
              </p>

              <h2
                id="collection-tools-empty-heading"
                className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
              >
                No specimens match these criteria
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Adjust the search or collection filters to broaden the archive
                results.
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