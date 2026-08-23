export type ReminderFrequencyUnit =
  | 'day'
  | 'week'
  | 'month';

export type ReminderStatus =
  | 'none'
  | 'upcoming'
  | 'due'
  | 'overdue';

export interface ReminderFrequency {
  interval: number;
  unit: ReminderFrequencyUnit;
}

export interface SpecimenReminder {
  enabled: boolean;

  frequency: ReminderFrequency;

  lastCompletedAt?: string;
  nextDueAt?: string;
}