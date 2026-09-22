import type {
  ReminderFrequency,
  SpecimenReminder,
} from "@/types";

export type CareEventType =
  | "care_completed"
  | "reminder_snoozed"
  | "reminder_skipped"
  | "reminder_created"
  | "reminder_updated"
  | "reminder_enabled"
  | "reminder_disabled";

export interface CareEvent {
  id: string;
  specimenId: string;
  eventType: CareEventType;
  scheduledFor?: string;
  occurredAt: string;
  nextDueAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CareReminderConfiguration {
  frequency: ReminderFrequency;
  nextDueAt: string;
}

export interface CareReminderState {
  reminder?: SpecimenReminder;
  recentEvents: CareEvent[];
}

export interface RecordCareInput {
  actionId: string;
  specimenId: string;
  completedAt: string;
}

export interface SnoozeCareInput {
  actionId: string;
  specimenId: string;
  snoozedUntil: string;
}

export interface SkipCareInput {
  actionId: string;
  specimenId: string;
}

export interface ConfigureCareReminderInput {
  actionId: string;
  specimenId: string;
  frequency: ReminderFrequency;
  nextDueAt: string;
}

export interface SetCareReminderEnabledInput {
  actionId: string;
  specimenId: string;
  enabled: boolean;
  nextDueAt?: string;
}

export interface CareMutationResult {
  reminder?: SpecimenReminder;
  event?: CareEvent;
}

export type CareGroup =
  | "overdue"
  | "today"
  | "upcoming"
  | "later";