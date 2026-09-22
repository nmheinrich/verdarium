import { supabase } from "@/lib/supabase";

import type {
  ReminderFrequency,
  ReminderFrequencyUnit,
  SpecimenReminder,
} from "@/types";

import type {
  CareEvent,
  CareEventType,
  CareMutationResult,
  ConfigureCareReminderInput,
  RecordCareInput,
  SetCareReminderEnabledInput,
  SkipCareInput,
  SnoozeCareInput,
} from "./types";

export interface CareError {
  code: string;
  message: string;
}

export type CareResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: CareError;
    };

interface RecordShape {
  [key: string]: unknown;
}

const CARE_EVENT_TYPES: readonly CareEventType[] = [
  "care_completed",
  "reminder_snoozed",
  "reminder_skipped",
  "reminder_created",
  "reminder_updated",
  "reminder_enabled",
  "reminder_disabled",
];

const REMINDER_FREQUENCY_UNITS: readonly ReminderFrequencyUnit[] = [
  "day",
  "week",
  "month",
];

function createCareError(
  code: string,
  message: string,
): CareError {
  return {
    code,
    message,
  };
}

function isRecord(
  value: unknown,
): value is RecordShape {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getOptionalString(
  value: unknown,
): string | undefined {
  return typeof value === "string" &&
    value.length > 0
    ? value
    : undefined;
}

function isCareEventType(
  value: unknown,
): value is CareEventType {
  return (
    typeof value === "string" &&
    CARE_EVENT_TYPES.includes(
      value as CareEventType,
    )
  );
}

function isReminderFrequencyUnit(
  value: unknown,
): value is ReminderFrequencyUnit {
  return (
    typeof value === "string" &&
    REMINDER_FREQUENCY_UNITS.includes(
      value as ReminderFrequencyUnit,
    )
  );
}

function parseReminderFrequency(
  value: unknown,
): ReminderFrequency | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.interval !== "number" ||
    !Number.isInteger(value.interval) ||
    value.interval <= 0 ||
    !isReminderFrequencyUnit(value.unit)
  ) {
    return null;
  }

  return {
    interval: value.interval,
    unit: value.unit,
  };
}

function parseReminder(
  value: unknown,
): SpecimenReminder | undefined {
  if (
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.enabled !== "boolean") {
    return undefined;
  }

  const frequency =
    parseReminderFrequency(
      value.frequency,
    );

  if (!frequency) {
    return undefined;
  }

  const lastCompletedAt =
    getOptionalString(
      value.lastCompletedAt,
    );

  const nextDueAt =
    getOptionalString(
      value.nextDueAt,
    );

  const snoozedUntil =
    getOptionalString(
      value.snoozedUntil,
    );

  return {
    enabled: value.enabled,
    frequency,
    ...(lastCompletedAt
      ? { lastCompletedAt }
      : {}),
    ...(nextDueAt
      ? { nextDueAt }
      : {}),
    ...(snoozedUntil
      ? { snoozedUntil }
      : {}),
  };
}

function parseMetadata(
  value: unknown,
): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return value;
}

function parseCareEvent(
  value: unknown,
): CareEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.specimenId !== "string" ||
    !isCareEventType(value.eventType) ||
    typeof value.occurredAt !== "string"
  ) {
    return null;
  }

  const scheduledFor =
    getOptionalString(
      value.scheduledFor,
    );

  const nextDueAt =
    getOptionalString(
      value.nextDueAt,
    );

  const metadata =
    parseMetadata(value.metadata);

  return {
    id: value.id,
    specimenId: value.specimenId,
    eventType: value.eventType,
    occurredAt: value.occurredAt,
    ...(scheduledFor
      ? { scheduledFor }
      : {}),
    ...(nextDueAt
      ? { nextDueAt }
      : {}),
    ...(metadata
      ? { metadata }
      : {}),
  };
}

function parseCareEventRow(
  value: unknown,
): CareEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  return parseCareEvent({
    id: value.id,
    specimenId: value.specimen_id,
    eventType: value.event_type,
    scheduledFor:
      value.scheduled_for,
    occurredAt:
      value.occurred_at,
    nextDueAt:
      value.next_due_at,
    metadata: value.metadata,
  });
}

function parseCareMutationResult(
  value: unknown,
): CareMutationResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const reminder =
    parseReminder(value.reminder);

  const event =
    value.event === null ||
    value.event === undefined
      ? undefined
      : parseCareEvent(value.event);

  if (
    value.reminder !== null &&
    value.reminder !== undefined &&
    !reminder
  ) {
    return null;
  }

  if (
    value.event !== null &&
    value.event !== undefined &&
    !event
  ) {
    return null;
  }

  return {
    ...(reminder
      ? { reminder }
      : {}),
    ...(event
      ? { event }
      : {}),
  };
}

function normalizeCareError(
  code: string,
): CareError {
  switch (code) {
    case "PGRST301":
    case "42501":
      return createCareError(
        code,
        "Verdarium could not verify access to this botanical record. Please sign in again and retry.",
      );

    case "23505":
      return createCareError(
        code,
        "This care action has already been recorded.",
      );

    default:
      return createCareError(
        code,
        "Verdarium could not update the care record. No visible changes were made.",
      );
  }
}

async function runCareMutation(
  rpcName:
    | "set_specimen_care_reminder"
    | "record_specimen_care"
    | "snooze_specimen_care"
    | "skip_specimen_care"
    | "set_specimen_care_reminder_enabled",
  parameters: Record<string, unknown>,
): Promise<
  CareResult<CareMutationResult>
> {
  try {
    const { data, error } =
      await supabase.rpc(
        rpcName,
        parameters,
      );

    if (error) {
      return {
        success: false,
        error: normalizeCareError(
          error.code ||
            "care_mutation_failed",
        ),
      };
    }

    const parsedResult =
      parseCareMutationResult(data);

    if (!parsedResult) {
      return {
        success: false,
        error: createCareError(
          "invalid_care_response",
          "Verdarium received an unexpected response while updating the care record.",
        ),
      };
    }

    return {
      success: true,
      data: parsedResult,
    };
  } catch {
    return {
      success: false,
      error: createCareError(
        "care_network_error",
        "Verdarium could not reach the private archive. Please check your connection and try again.",
      ),
    };
  }
}

export async function configureCareReminder(
  input: ConfigureCareReminderInput,
): Promise<
  CareResult<CareMutationResult>
> {
  return runCareMutation(
    "set_specimen_care_reminder",
    {
      p_action_id: input.actionId,
      p_specimen_id: input.specimenId,
      p_interval:
        input.frequency.interval,
      p_unit:
        input.frequency.unit,
      p_next_due_at:
        input.nextDueAt,
    },
  );
}

export async function recordCare(
  input: RecordCareInput,
): Promise<
  CareResult<CareMutationResult>
> {
  return runCareMutation(
    "record_specimen_care",
    {
      p_action_id: input.actionId,
      p_specimen_id: input.specimenId,
      p_completed_at:
        input.completedAt,
    },
  );
}

export async function snoozeCare(
  input: SnoozeCareInput,
): Promise<
  CareResult<CareMutationResult>
> {
  return runCareMutation(
    "snooze_specimen_care",
    {
      p_action_id: input.actionId,
      p_specimen_id: input.specimenId,
      p_snoozed_until:
        input.snoozedUntil,
    },
  );
}

export async function skipCare(
  input: SkipCareInput,
): Promise<
  CareResult<CareMutationResult>
> {
  return runCareMutation(
    "skip_specimen_care",
    {
      p_action_id: input.actionId,
      p_specimen_id: input.specimenId,
    },
  );
}

export async function setCareReminderEnabled(
  input: SetCareReminderEnabledInput,
): Promise<
  CareResult<CareMutationResult>
> {
  return runCareMutation(
    "set_specimen_care_reminder_enabled",
    {
      p_action_id: input.actionId,
      p_specimen_id: input.specimenId,
      p_enabled: input.enabled,
      p_next_due_at:
        input.nextDueAt ?? null,
    },
  );
}

export async function loadSpecimenCareHistory(
  specimenId: string,
  limit = 10,
): Promise<CareResult<CareEvent[]>> {
  if (!specimenId.trim()) {
    return {
      success: false,
      error: createCareError(
        "invalid_specimen_id",
        "Verdarium could not identify the botanical record.",
      ),
    };
  }

  const safeLimit = Math.min(
    Math.max(
      Math.trunc(limit),
      1,
    ),
    100,
  );

  try {
    const { data, error } =
      await supabase
        .from("care_events")
        .select(
          [
            "id",
            "specimen_id",
            "event_type",
            "scheduled_for",
            "occurred_at",
            "next_due_at",
            "metadata",
          ].join(","),
        )
        .eq(
          "specimen_id",
          specimenId,
        )
        .order(
          "occurred_at",
          {
            ascending: false,
          },
        )
        .limit(safeLimit);

    if (error) {
      return {
        success: false,
        error: normalizeCareError(
          error.code ||
            "care_history_load_failed",
        ),
      };
    }

    const events: CareEvent[] = [];

    for (const row of data ?? []) {
      const event =
        parseCareEventRow(row);

      if (!event) {
        return {
          success: false,
          error: createCareError(
            "invalid_care_history",
            "Verdarium received an unexpected care-history record.",
          ),
        };
      }

      events.push(event);
    }

    return {
      success: true,
      data: events,
    };
  } catch {
    return {
      success: false,
      error: createCareError(
        "care_history_network_error",
        "Verdarium could not retrieve the stewardship history. Please check your connection and try again.",
      ),
    };
  }
}