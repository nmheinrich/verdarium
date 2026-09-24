import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

import { getEffectiveReminderDueAt } from "@/lib";
import type { SpecimenReminder } from "@/types";

export interface SnoozeOption {
  /** yyyy-MM-dd, sent as p_snoozed_until. */
  value: string;
  label: string;
}

const SNOOZE_OFFSETS = [1, 3, 7] as const;

function toDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = parseISO(value);

  return isValid(date) ? startOfDay(date) : null;
}

function latest(dates: Array<Date | null>): Date {
  return dates.reduce<Date>(
    (current, date) =>
      date && isAfter(date, current) ? date : current,
    startOfDay(new Date(0)),
  );
}

/**
 * The earliest date a snooze may land on, as the server checks it:
 * strictly after the scheduled date, the current snooze and today.
 * "Today" is taken as the later of the local and the UTC calendar day,
 * because the RPC compares against the database's current_date (UTC).
 */
export function getEarliestSnoozeDate(
  reminder: SpecimenReminder,
  now = new Date(),
): Date {
  const utcToday = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );

  const base = latest([
    toDate(reminder.nextDueAt),
    toDate(getEffectiveReminderDueAt(reminder) ?? undefined),
    startOfDay(now),
    utcToday,
  ]);

  return addDays(base, 1);
}

function formatOptionLabel(date: Date, now: Date): string {
  const days = differenceInCalendarDays(date, now);

  if (days === 1) {
    return "Tomorrow";
  }

  return format(date, "EEE, MMM d");
}

export function getSnoozeOptions(
  reminder: SpecimenReminder,
  now = new Date(),
): SnoozeOption[] {
  const earliest = getEarliestSnoozeDate(reminder, now);

  return SNOOZE_OFFSETS.map((offset) => {
    const date = addDays(earliest, offset - 1);

    return {
      value: format(date, "yyyy-MM-dd"),
      label: formatOptionLabel(date, now),
    };
  });
}
