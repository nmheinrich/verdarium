import {
  addDays,
  compareAsc,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

import {
  getEffectiveReminderDueAt,
  getReminderStatus,
} from "@/lib";

import type {
  Specimen,
  SpecimenReminder,
} from "@/types";

import type { CareGroup } from "./types";

export interface CareSpecimen {
  specimen: Specimen;
  reminder: SpecimenReminder;
  effectiveDueAt: string;
  group: CareGroup;
}

export interface CareOverview {
  overdue: CareSpecimen[];
  today: CareSpecimen[];
  upcoming: CareSpecimen[];
  later: CareSpecimen[];
}

const DEFAULT_UPCOMING_WINDOW_DAYS = 14;

function compareSpecimenName(
  left: CareSpecimen,
  right: CareSpecimen,
): number {
  return left.specimen.commonName.localeCompare(
    right.specimen.commonName,
    undefined,
    {
      sensitivity: "base",
    },
  );
}

function compareEffectiveDueDate(
  left: CareSpecimen,
  right: CareSpecimen,
): number {
  return compareAsc(
    parseISO(left.effectiveDueAt),
    parseISO(right.effectiveDueAt),
  );
}

function getCareGroup(
  reminder: SpecimenReminder,
  referenceDate: Date,
  upcomingWindowDays: number,
): CareGroup | null {
  const effectiveDueAt =
    getEffectiveReminderDueAt(reminder);

  if (!effectiveDueAt) {
    return null;
  }

  const status =
    getReminderStatus(
      reminder,
      referenceDate,
    );

  if (status === "overdue") {
    return "overdue";
  }

  if (status === "due") {
    return "today";
  }

  if (status !== "upcoming") {
    return null;
  }

  const dueDate =
    startOfDay(
      parseISO(effectiveDueAt),
    );

  const today =
    startOfDay(referenceDate);

  const upcomingBoundary =
    addDays(
      today,
      upcomingWindowDays,
    );

  if (
    isSameDay(
      dueDate,
      upcomingBoundary,
    ) ||
    (
      isAfter(
        dueDate,
        today,
      ) &&
      isBefore(
        dueDate,
        upcomingBoundary,
      )
    )
  ) {
    return "upcoming";
  }

  return "later";
}

function createCareSpecimen(
  specimen: Specimen,
  referenceDate: Date,
  upcomingWindowDays: number,
): CareSpecimen | null {
  const reminder = specimen.reminder;

  if (!reminder?.enabled) {
    return null;
  }

  const effectiveDueAt =
    getEffectiveReminderDueAt(reminder);

  if (!effectiveDueAt) {
    return null;
  }

  const group =
    getCareGroup(
      reminder,
      referenceDate,
      upcomingWindowDays,
    );

  if (!group) {
    return null;
  }

  return {
    specimen,
    reminder,
    effectiveDueAt,
    group,
  };
}

export function createCareOverview(
  specimens: Specimen[],
  referenceDate = new Date(),
  upcomingWindowDays =
    DEFAULT_UPCOMING_WINDOW_DAYS,
): CareOverview {
  const safeUpcomingWindowDays =
    Number.isFinite(upcomingWindowDays)
      ? Math.max(
          1,
          Math.trunc(
            upcomingWindowDays,
          ),
        )
      : DEFAULT_UPCOMING_WINDOW_DAYS;

  const overview: CareOverview = {
    overdue: [],
    today: [],
    upcoming: [],
    later: [],
  };

  for (const specimen of specimens) {
    const careSpecimen =
      createCareSpecimen(
        specimen,
        referenceDate,
        safeUpcomingWindowDays,
      );

    if (!careSpecimen) {
      continue;
    }

    overview[
      careSpecimen.group
    ].push(careSpecimen);
  }

  overview.overdue.sort(
    (left, right) => {
      const dateComparison =
        compareEffectiveDueDate(
          left,
          right,
        );

      return dateComparison !== 0
        ? dateComparison
        : compareSpecimenName(
            left,
            right,
          );
    },
  );

  overview.today.sort(
    compareSpecimenName,
  );

  overview.upcoming.sort(
    (left, right) => {
      const dateComparison =
        compareEffectiveDueDate(
          left,
          right,
        );

      return dateComparison !== 0
        ? dateComparison
        : compareSpecimenName(
            left,
            right,
          );
    },
  );

  overview.later.sort(
    (left, right) => {
      const dateComparison =
        compareEffectiveDueDate(
          left,
          right,
        );

      return dateComparison !== 0
        ? dateComparison
        : compareSpecimenName(
            left,
            right,
          );
    },
  );

  return overview;
}

export function getCareAttentionCount(
  overview: CareOverview,
): number {
  return (
    overview.overdue.length +
    overview.today.length
  );
}

export function getNextCareSpecimen(
  overview: CareOverview,
): CareSpecimen | null {
  return (
    overview.overdue[0] ??
    overview.today[0] ??
    overview.upcoming[0] ??
    overview.later[0] ??
    null
  );
}