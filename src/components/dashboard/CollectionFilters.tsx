import { ChevronDown, Heart, Search } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib";
import type {
  SpecimenFilters,
  SpecimenSortOption,
} from "@/lib";

interface CollectionFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: SpecimenFilters;
  onFiltersChange: (filters: SpecimenFilters) => void;
  sortOption: SpecimenSortOption;
  onSortChange: (sortOption: SpecimenSortOption) => void;
  dueCount: number;
  resultLabel: string;
  onClear?: () => void;
}

interface Option<Value extends string> {
  value: Value;
  label: string;
}

const HEALTH_OPTIONS: Option<SpecimenFilters["healthStatus"]>[] = [
  { value: "all", label: "All" },
  { value: "thriving", label: "Thriving" },
  { value: "stable", label: "Stable" },
  { value: "watch", label: "Watch" },
  { value: "recovering", label: "Recovering" },
  { value: "unknown", label: "Unknown" },
];

const SORT_OPTIONS: Option<SpecimenSortOption>[] = [
  { value: "updated-desc", label: "Recently updated" },
  { value: "created-desc", label: "Recently added" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "scientific-asc", label: "Scientific name A–Z" },
];

const chipClassName = cn(
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3.5 text-[0.8125rem] font-medium leading-none text-[var(--color-text-secondary)]",
  "transition-[background-color,border-color,color] duration-[160ms] ease-[var(--ease-standard)]",
  "hover:border-[var(--color-botanical-muted)] hover:text-[var(--color-text-primary)]",
  "aria-pressed:border-transparent aria-pressed:bg-[var(--color-botanical-soft)] aria-pressed:text-[var(--color-botanical)]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
);

function FilterSelect<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: Value;
  options: Option<Value>[];
  onChange: (value: Value) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <label
        htmlFor={id}
        className="metadata-label text-[var(--color-text-secondary)]"
      >
        {label}
      </label>
      <span className="relative inline-flex">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as Value)}
          className={cn(
            "h-8 cursor-pointer appearance-none rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] pl-3 pr-8 text-[0.8125rem] text-[var(--color-text-primary)] shadow-[var(--shadow-control)] outline-none",
            "transition-[border-color,box-shadow] duration-[160ms] ease-[var(--ease-standard)]",
            "hover:border-[var(--color-text-muted)] focus:border-[var(--color-botanical)] focus:shadow-[0_0_0_3px_var(--color-botanical-soft)]",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.75}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
        />
      </span>
    </div>
  );
}

/** The collection toolbar (design system: CollectionFilters). Holds no state. */
export function CollectionFilters({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  sortOption,
  onSortChange,
  dueCount,
  resultLabel,
  onClear,
}: CollectionFiltersProps) {
  return (
    <div className="flex flex-col gap-3.5">
      <label className="relative block">
        <span className="visually-hidden">Search the collection</span>
        <Search
          aria-hidden="true"
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search names, genus, tags…"
          className={cn(
            "h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] pl-10 pr-3.5 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-control)] outline-none",
            "placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)] focus:border-[var(--color-botanical)] focus:shadow-[0_0_0_3px_var(--color-botanical-soft)]",
          )}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Quick filters"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            aria-pressed={filters.dueToday}
            onClick={() =>
              onFiltersChange({
                ...filters,
                dueToday: !filters.dueToday,
              })
            }
            className={chipClassName}
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-[var(--radius-full)] bg-[var(--color-reminder-due-ink)]"
            />
            Due today
            {dueCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-reminder-due)] px-1.5 text-[0.6875rem] font-semibold text-[var(--color-text-primary)]">
              {dueCount}
            </span>
            ) : null}
          </button>

          <button
            type="button"
            aria-pressed={filters.favoritesOnly}
            onClick={() =>
              onFiltersChange({
                ...filters,
                favoritesOnly: !filters.favoritesOnly,
              })
            }
            className={chipClassName}
          >
            <Heart
              aria-hidden="true"
              size={14}
              strokeWidth={1.75}
              className="text-[var(--color-botanical)]"
            />
            Favorites
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect
            id="collection-health-filter"
            label="Health"
            value={filters.healthStatus}
            options={HEALTH_OPTIONS}
            onChange={(healthStatus) =>
              onFiltersChange({ ...filters, healthStatus })
            }
          />
          <FilterSelect
            id="collection-sort"
            label="Sort"
            value={sortOption}
            options={SORT_OPTIONS}
            onChange={onSortChange}
          />
        </div>
      </div>

      <div className="flex min-h-8 items-center justify-between gap-3 border-t border-[var(--color-border)] pt-2.5">
        <p
          aria-live="polite"
          className="text-xs text-[var(--color-text-secondary)]"
        >
          {resultLabel}
        </p>
        {onClear ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
