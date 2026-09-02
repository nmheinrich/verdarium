import { REMINDER_STATUS_LABELS } from "@/constants";
import type { SpecimenFilters } from "@/lib";
import type {
  ReminderStatus,
  SpecimenHealthStatus,
} from "@/types";

interface CollectionFiltersProps {
  filters: SpecimenFilters;
  onChange: (filters: SpecimenFilters) => void;
}

const HEALTH_STATUS_OPTIONS: Array<{
  value: SpecimenHealthStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "thriving", label: "Thriving" },
  { value: "stable", label: "Stable" },
  { value: "watch", label: "Watch" },
  { value: "recovering", label: "Recovering" },
  { value: "unknown", label: "Unknown" },
];

const REMINDER_STATUS_OPTIONS: Array<{
  value: Exclude<ReminderStatus, "none"> | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  {
    value: "upcoming",
    label: REMINDER_STATUS_LABELS.upcoming,
  },
  {
    value: "due",
    label: REMINDER_STATUS_LABELS.due,
  },
  {
    value: "overdue",
    label: REMINDER_STATUS_LABELS.overdue,
  },
];

export function CollectionFilters({
  filters,
  onChange,
}: CollectionFiltersProps) {
  return (
    <div className="grid gap-5 border-t border-[var(--color-border)] pt-6 sm:grid-cols-3">
      <div>
        <label
          htmlFor="collection-health-filter"
          className="metadata-label"
        >
          Health
        </label>

        <select
          id="collection-health-filter"
          value={filters.healthStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              healthStatus:
                event.target
                  .value as SpecimenFilters["healthStatus"],
            })
          }
          className="mt-2 w-full border-0 border-b border-[var(--color-border-strong)] bg-transparent px-0 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-botanical)]"
        >
          {HEALTH_STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="collection-reminder-filter"
          className="metadata-label"
        >
          Reminder
        </label>

        <select
          id="collection-reminder-filter"
          value={filters.reminderStatus}
          onChange={(event) =>
            onChange({
              ...filters,
              reminderStatus:
                event.target
                  .value as SpecimenFilters["reminderStatus"],
            })
          }
          className="mt-2 w-full border-0 border-b border-[var(--color-border-strong)] bg-transparent px-0 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-botanical)]"
        >
          {REMINDER_STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="collection-favorites-filter"
          className="metadata-label"
        >
          Favorites
        </label>

        <select
          id="collection-favorites-filter"
          value={filters.favoritesOnly ? "favorites" : "all"}
          onChange={(event) =>
            onChange({
              ...filters,
              favoritesOnly:
                event.target.value === "favorites",
            })
          }
          className="mt-2 w-full border-0 border-b border-[var(--color-border-strong)] bg-transparent px-0 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-botanical)]"
        >
          <option value="all">All</option>
          <option value="favorites">
            Favorites only
          </option>
        </select>
      </div>
    </div>
  );
}