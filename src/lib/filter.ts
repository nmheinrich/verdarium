import { getReminderStatus } from "@/lib/reminder";
import type {
  ReminderStatus,
  Specimen,
  SpecimenHealthStatus,
} from "@/types";

export interface SpecimenFilters {
  healthStatus: SpecimenHealthStatus | "all";
  reminderStatus: Exclude<ReminderStatus, "none"> | "all";
  favoritesOnly: boolean;
}

export const DEFAULT_SPECIMEN_FILTERS: SpecimenFilters = {
  healthStatus: "all",
  reminderStatus: "all",
  favoritesOnly: false,
};

export function filterSpecimens(
  specimens: Specimen[],
  filters: SpecimenFilters,
): Specimen[] {
  return specimens.filter((specimen) => {
    if (
      filters.healthStatus !== "all" &&
      specimen.healthStatus !== filters.healthStatus
    ) {
      return false;
    }

    if (
      filters.reminderStatus !== "all" &&
      getReminderStatus(specimen.reminder) !== filters.reminderStatus
    ) {
      return false;
    }

    if (filters.favoritesOnly && !specimen.isFavorite) {
      return false;
    }

    return true;
  });
}

export function countActiveSpecimenFilters(
  filters: SpecimenFilters,
): number {
  let activeCount = 0;

  if (filters.healthStatus !== "all") {
    activeCount += 1;
  }

  if (filters.reminderStatus !== "all") {
    activeCount += 1;
  }

  if (filters.favoritesOnly) {
    activeCount += 1;
  }

  return activeCount;
}