import { differenceInCalendarDays } from "date-fns";

import {
  getEffectiveReminderDueAt,
  getReminderStatus,
} from "@/lib/reminder";

import type { ReminderStatus, SpecimenReminder } from "@/types";

export interface CareStateLabel {
  status: Exclude<ReminderStatus, "none">;
  label: string;
}

function parseDueDate(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDays(count: number): string {
  return count === 1 ? "1 day" : `${count} days`;
}

/**
 * The written-out care state from the design system:
 * "Next care in 3 days", "Care due today", "Care overdue · 2 days".
 */
export function getCareStateLabel(
  reminder: SpecimenReminder | undefined,
  referenceDate = new Date(),
): CareStateLabel | null {
  const status = getReminderStatus(reminder, referenceDate);

  if (status === "none") {
    return null;
  }

  if (status === "due") {
    return { status, label: "Care due today" };
  }

  const effectiveDueAt = getEffectiveReminderDueAt(reminder);
  const dueDate = effectiveDueAt
    ? parseDueDate(effectiveDueAt)
    : null;

  if (!dueDate) {
    return null;
  }

  const days = Math.abs(
    differenceInCalendarDays(dueDate, referenceDate),
  );

  if (status === "overdue") {
    return {
      status,
      label: `Care overdue · ${formatDays(days)}`,
    };
  }

  return {
    status,
    label:
      days === 1 ? "Next care tomorrow" : `Next care in ${formatDays(days)}`,
  };
}
