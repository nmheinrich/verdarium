import { getReminderStatus } from "@/lib/reminder";

import type {
  Specimen,
  SpecimenHealthStatus,
} from "@/types";

export interface SpecimenFilters {
  healthStatus: SpecimenHealthStatus | "all";
  /** Only specimens whose care is due today or overdue. */
  dueToday: boolean;
  favoritesOnly: boolean;
}

export const DEFAULT_SPECIMEN_FILTERS: SpecimenFilters = {
  healthStatus: "all",
  dueToday: false,
  favoritesOnly: false,
};

export function isSpecimenCareDue(
  specimen: Specimen,
  referenceDate = new Date(),
): boolean {
  const status = getReminderStatus(
    specimen.reminder,
    referenceDate,
  );

  return status === "due" || status === "overdue";
}

export function filterSpecimens(
  specimens: Specimen[],
  filters: SpecimenFilters,
  referenceDate = new Date(),
): Specimen[] {
  return specimens.filter((specimen) => {
    if (
      filters.healthStatus !== "all" &&
      specimen.healthStatus !== filters.healthStatus
    ) {
      return false;
    }

    if (
      filters.dueToday &&
      !isSpecimenCareDue(specimen, referenceDate)
    ) {
      return false;
    }

    if (filters.favoritesOnly && !specimen.isFavorite) {
      return false;
    }

    return true;
  });
}

/**
 * Stable reorder that puts overdue specimens before due ones. Only applied
 * while the Due today filter is on; the unfiltered archive keeps its sort.
 */
export function orderByCareUrgency(
  specimens: Specimen[],
  referenceDate = new Date(),
): Specimen[] {
  const overdue: Specimen[] = [];
  const rest: Specimen[] = [];

  for (const specimen of specimens) {
    if (
      getReminderStatus(specimen.reminder, referenceDate) ===
      "overdue"
    ) {
      overdue.push(specimen);
    } else {
      rest.push(specimen);
    }
  }

  return [...overdue, ...rest];
}

export function countActiveSpecimenFilters(
  filters: SpecimenFilters,
): number {
  let activeCount = 0;

  if (filters.healthStatus !== "all") {
    activeCount += 1;
  }

  if (filters.dueToday) {
    activeCount += 1;
  }

  if (filters.favoritesOnly) {
    activeCount += 1;
  }

  return activeCount;
}
