import {
  addDays,
  addMonths,
  addWeeks,
  isBefore,
  isSameDay,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

import type {
  ReminderFrequency,
  ReminderStatus,
  SpecimenReminder,
} from "@/types";

function parseReminderDate(value: string): Date | null {
  const parsedDate = parseISO(value);

  return isValid(parsedDate) ? parsedDate : null;
}

export function getReminderStatus(
  reminder: SpecimenReminder | undefined,
  referenceDate = new Date(),
): ReminderStatus {
  if (!reminder?.enabled || !reminder.nextDueAt) {
    return "none";
  }

  const dueDate = parseReminderDate(reminder.nextDueAt);

  if (!dueDate || !isValid(referenceDate)) {
    return "none";
  }

  if (isSameDay(dueDate, referenceDate)) {
    return "due";
  }

  if (
    isBefore(
      startOfDay(dueDate),
      startOfDay(referenceDate),
    )
  ) {
    return "overdue";
  }

  return "upcoming";
}

export function calculateNextReminderDueAt(
  completedAt: string,
  frequency: ReminderFrequency,
): string | null {
  const completedDate = parseReminderDate(completedAt);

  if (
    !completedDate ||
    !Number.isInteger(frequency.interval) ||
    frequency.interval <= 0
  ) {
    return null;
  }

  let nextDueDate: Date;

  switch (frequency.unit) {
    case "day":
      nextDueDate = addDays(
        completedDate,
        frequency.interval,
      );
      break;

    case "week":
      nextDueDate = addWeeks(
        completedDate,
        frequency.interval,
      );
      break;

    case "month":
      nextDueDate = addMonths(
        completedDate,
        frequency.interval,
      );
      break;

    default:
      return null;
  }

  return isValid(nextDueDate)
    ? nextDueDate.toISOString()
    : null;
}