import type {
  ReminderFrequency,
  ReminderFrequencyUnit,
  SpecimenReminder,
} from "@/types";

export interface ReminderValidationIssue {
  field: string;
  message: string;
}

export type ReminderValidationResult =
  | {
      success: true;
      data: SpecimenReminder;
      issues: [];
    }
  | {
      success: false;
      data: null;
      issues: ReminderValidationIssue[];
    };

const reminderFrequencyUnits = [
  "day",
  "week",
  "month",
] as const satisfies readonly ReminderFrequencyUnit[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const isoTimestampPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

  if (!isoTimestampPattern.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

export function isReminderFrequencyUnit(
  value: unknown,
): value is ReminderFrequencyUnit {
  return (
    typeof value === "string" &&
    reminderFrequencyUnits.some((unit) => unit === value)
  );
}

function validateFrequency(
  value: unknown,
  issues: ReminderValidationIssue[],
): ReminderFrequency | null {
  if (!isRecord(value)) {
    issues.push({
      field: "frequency",
      message: "Reminder frequency must be an object.",
    });

    return null;
  }

  const { interval, unit } = value;

  if (!isPositiveInteger(interval)) {
    issues.push({
      field: "frequency.interval",
      message: "Reminder interval must be a positive whole number.",
    });
  }

  if (!isReminderFrequencyUnit(unit)) {
    issues.push({
      field: "frequency.unit",
      message: "Reminder frequency unit must be day, week, or month.",
    });
  }

  if (!isPositiveInteger(interval) || !isReminderFrequencyUnit(unit)) {
    return null;
  }

  return {
    interval,
    unit,
  };
}

export function validateSpecimenReminder(
  value: unknown,
): ReminderValidationResult {
  const issues: ReminderValidationIssue[] = [];

  if (!isRecord(value)) {
    return {
      success: false,
      data: null,
      issues: [
        {
          field: "reminder",
          message: "Reminder must be an object.",
        },
      ],
    };
  }

  const { enabled, frequency, lastCompletedAt, nextDueAt } = value;

  if (typeof enabled !== "boolean") {
    issues.push({
      field: "enabled",
      message: "Reminder enabled state must be true or false.",
    });
  }

  const validatedFrequency = validateFrequency(frequency, issues);

  if (
    lastCompletedAt !== undefined &&
    !isIsoTimestamp(lastCompletedAt)
  ) {
    issues.push({
      field: "lastCompletedAt",
      message: "Last completed date must be a valid ISO timestamp.",
    });
  }

  if (nextDueAt !== undefined && !isIsoTimestamp(nextDueAt)) {
    issues.push({
      field: "nextDueAt",
      message: "Next due date must be a valid ISO timestamp.",
    });
  }

  if (
    issues.length > 0 ||
    typeof enabled !== "boolean" ||
    validatedFrequency === null
  ) {
    return {
      success: false,
      data: null,
      issues,
    };
  }

  const reminder: SpecimenReminder = {
    enabled,
    frequency: validatedFrequency,
  };

  if (typeof lastCompletedAt === "string") {
    reminder.lastCompletedAt = lastCompletedAt;
  }

  if (typeof nextDueAt === "string") {
    reminder.nextDueAt = nextDueAt;
  }

  return {
    success: true,
    data: reminder,
    issues: [],
  };
}