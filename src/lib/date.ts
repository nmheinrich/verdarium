import { format, isValid, parseISO } from 'date-fns';

export function parseIsoDate(value: string): Date | null {
  const parsedDate = parseISO(value);

  return isValid(parsedDate) ? parsedDate : null;
}

export function formatDisplayDate(
  value: string,
  formatPattern = 'MMM d, yyyy',
): string | null {
  const parsedDate = parseIsoDate(value);

  if (!parsedDate) {
    return null;
  }

  return format(parsedDate, formatPattern);
}

export function toIsoString(value: Date): string | null {
  if (!isValid(value)) {
    return null;
  }

  return value.toISOString();
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}