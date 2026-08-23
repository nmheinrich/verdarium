import type {
  ReminderFrequencyUnit,
  ReminderStatus,
} from '../types';

export const REMINDER_FREQUENCY_UNITS: readonly ReminderFrequencyUnit[] = [
  'day',
  'week',
  'month',
];

export const REMINDER_FREQUENCY_LABELS: Record<
  ReminderFrequencyUnit,
  string
> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};

export const REMINDER_STATUS_LABELS: Record<
  ReminderStatus,
  string
> = {
  none: 'No reminder',
  upcoming: 'Upcoming',
  due: 'Due today',
  overdue: 'Overdue',
};