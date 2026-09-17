import { useMemo, useState } from "react";

import { ErrorState, Surface } from "@/components/ui";

import {
  countActiveSpecimenFilters,
  DEFAULT_SPECIMEN_FILTERS,
  DEFAULT_SPECIMEN_SORT,
  filterSpecimens,
  searchSpecimens,
  sortSpecimens,
} from "@/lib";

import type { CollectionStorageError } from "@/storage";
import type { Specimen } from "@/types";

import { CollectionSearch } from "./CollectionSearch";
import { CollectionSummary } from "./CollectionSummary";
import { CompactCollectionView } from "./CompactCollectionView";
import { EmptyCollection } from "./EmptyCollection";
import { RecentSpecimens } from "./RecentSpecimens";

interface DashboardProps {
  specimens: Specimen[];
  loadError?: CollectionStorageError | null;
  onSpecimenSelect?: (specimen: Specimen) => void;
  onAddSpecimen?: () => void;
}

function getCollectionLoadErrorDescription(
  error: CollectionStorageError,
): string {
  switch (error.code) {
    case "storage-unavailable":
      return "Verdarium cannot access browser storage right now. Your existing archive has not been changed.";

    case "invalid-json":
      return "The saved botanical archive could not be read safely. Verdarium has left the stored data unchanged.";

    case "invalid-schema":
      return "The saved archive does not match the collection format Verdarium expects. The stored data has not been changed.";

    case "unsupported-version":
      return "This botanical archive was created with a version of Verdarium that this build cannot open safely.";

    case "invalid-specimen":
      return "One or more specimen records in the saved archive could not be validated. Verdarium has left the stored data unchanged.";

    case "duplicate-id":
      return "The saved archive contains conflicting specimen records and could not be opened safely. The stored data has not been changed.";

    case "specimen-not-found":
      return "Verdarium could not locate a botanical record expected in the saved archive.";

    case "write-failed":
      return "Verdarium encountered a storage problem while opening the botanical archive. Your existing data has not been intentionally changed.";

    default:
      return "Verdarium was unable to safely open the botanical archive. Your existing stored collection has been left unchanged.";
  }
}

export function Dashboard({
  specimens,
  loadError = null,
  onSpecimenSelect,
  onAddSpecimen,
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
        <ErrorState
          eyebrow="Archive unavailable"
          titleId="collection-load-error-heading"
          title="The botanical archive could not be loaded"
          description={getCollectionLoadErrorDescription(
            loadError,
          )}
        />
      </section>
    );
  }

  if (specimens.length === 0) {
    return (
      <EmptyCollection
        onAddSpecimen={onAddSpecimen}
      />
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

      {visibleSpecimens.length > 0 ? (
        <CompactCollectionView
          specimens={visibleSpecimens}
          onSpecimenSelect={onSpecimenSelect}
        />
      ) : (
        <section
          aria-labelledby="collection-tools-empty-heading"
        >
          <Surface
            variant="subtle"
            className="p-6 sm:p-8"
          >
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
              Adjust the search or collection
              filters to broaden the archive
              results.
            </p>
          </Surface>
        </section>
      )}

      {!areCollectionToolsActive ? (
        <RecentSpecimens
          specimens={specimens}
          onSpecimenSelect={onSpecimenSelect}
        />
      ) : null}
    </div>
  );
}