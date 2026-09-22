import {
  addDays,
  addMonths,
  addWeeks,
  format,
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

const REMINDER_DATE_FORMAT = "yyyy-MM-dd";

function parseReminderDate(
  value: string,
): Date | null {
  const parsedDate = parseISO(value);

  return isValid(parsedDate)
    ? parsedDate
    : null;
}

function isValidFrequency(
  frequency: ReminderFrequency,
): boolean {
  return (
    Number.isInteger(frequency.interval) &&
    frequency.interval > 0
  );
}

function addReminderFrequency(
  date: Date,
  frequency: ReminderFrequency,
): Date | null {
  if (!isValidFrequency(frequency)) {
    return null;
  }

  switch (frequency.unit) {
    case "day":
      return addDays(
        date,
        frequency.interval,
      );

    case "week":
      return addWeeks(
        date,
        frequency.interval,
      );

    case "month":
      return addMonths(
        date,
        frequency.interval,
      );

    default:
      return null;
  }
}

function formatReminderDate(
  date: Date,
): string | null {
  if (!isValid(date)) {
    return null;
  }

  return format(
    date,
    REMINDER_DATE_FORMAT,
  );
}

export function normalizeReminderDate(
  value: string,
): string | null {
  const date = parseReminderDate(value);

  if (!date) {
    return null;
  }

  return formatReminderDate(date);
}

export function getEffectiveReminderDueAt(
  reminder: SpecimenReminder | undefined,
): string | null {
  if (
    !reminder?.enabled ||
    !reminder.nextDueAt
  ) {
    return null;
  }

  if (reminder.snoozedUntil) {
    const snoozedUntil =
      normalizeReminderDate(
        reminder.snoozedUntil,
      );

    if (snoozedUntil) {
      return snoozedUntil;
    }
  }

  return normalizeReminderDate(
    reminder.nextDueAt,
  );
}

export function getReminderStatus(
  reminder: SpecimenReminder | undefined,
  referenceDate = new Date(),
): ReminderStatus {
  const effectiveDueAt =
    getEffectiveReminderDueAt(reminder);

  if (
    !effectiveDueAt ||
    !isValid(referenceDate)
  ) {
    return "none";
  }

  const dueDate =
    parseReminderDate(effectiveDueAt);

  if (!dueDate) {
    return "none";
  }

  if (
    isSameDay(
      dueDate,
      referenceDate,
    )
  ) {
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
  const completedDate =
    parseReminderDate(completedAt);

  if (!completedDate) {
    return null;
  }

  const nextDueDate =
    addReminderFrequency(
      completedDate,
      frequency,
    );

  if (!nextDueDate) {
    return null;
  }

  return formatReminderDate(nextDueDate);
}

export function calculateNextScheduledReminderDueAt(
  scheduledFor: string,
  frequency: ReminderFrequency,
): string | null {
  const scheduledDate =
    parseReminderDate(scheduledFor);

  if (!scheduledDate) {
    return null;
  }

  const nextDueDate =
    addReminderFrequency(
      scheduledDate,
      frequency,
    );

  if (!nextDueDate) {
    return null;
  }

  return formatReminderDate(nextDueDate);
}