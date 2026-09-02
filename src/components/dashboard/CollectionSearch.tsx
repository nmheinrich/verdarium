import { useState } from "react";
import {
  ChevronRight,
  Search,
} from "lucide-react";

import type { SpecimenFilters } from "@/lib";

import { CollectionFilters } from "./CollectionFilters";

interface CollectionSearchProps {
  value: string;
  filters: SpecimenFilters;
  activeCount: number;
  onChange: (value: string) => void;
  onFiltersChange: (filters: SpecimenFilters) => void;
}

export function CollectionSearch({
  value,
  filters,
  activeCount,
  onChange,
  onFiltersChange,
}: CollectionSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section aria-labelledby="collection-tools-heading">
      <button
        type="button"
        className="group flex items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]"
        aria-expanded={isExpanded}
        aria-controls="collection-tools-panel"
        onClick={() =>
          setIsExpanded((currentValue) => !currentValue)
        }
      >
        <ChevronRight
          aria-hidden="true"
          size={14}
          strokeWidth={1.75}
          className={`shrink-0 text-[var(--color-text-muted)] transition-transform duration-[var(--transition-base)] ${
            isExpanded ? "rotate-90" : ""
          }`}
        />

        <span
          id="collection-tools-heading"
          className="metadata-label transition-colors duration-[var(--transition-base)] group-hover:text-[var(--color-text-primary)]"
        >
          Filter and Search
          {activeCount > 0 ? ` · ${activeCount} active` : ""}
        </span>
      </button>

      {isExpanded ? (
        <div
          id="collection-tools-panel"
          className="mt-5 max-w-3xl"
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-2 pb-1.5">
              <Search
                aria-hidden="true"
                size={12}
                strokeWidth={1.75}
                className="shrink-0 text-[var(--color-text-muted)]"
              />

              <label
                htmlFor="collection-search"
                className="visually-hidden"
              >
                Search specimens
              </label>

              <input
                id="collection-search"
                type="search"
                value={value}
                onChange={(event) =>
                  onChange(event.target.value)
                }
                placeholder="Search the collection"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-1 text-xs italic text-[var(--color-text-primary)] outline-none placeholder:italic placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          <CollectionFilters
            filters={filters}
            onChange={onFiltersChange}
          />
        </div>
      ) : null}
    </section>
  );
}