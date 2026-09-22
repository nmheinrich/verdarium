import {
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  CheckCircle2,
  History,
  Pause,
  Play,
  RefreshCw,
  SkipForward,
} from "lucide-react";

import {
  loadSpecimenCareHistory,
} from "@/care/careService";

import type {
  CareEvent,
  CareEventType,
} from "@/care/types";

import {
  Button,
  Surface,
} from "@/components/ui";

interface CareHistoryProps {
  specimenId: string;
  refreshToken?: number;
}

function formatDate(
  value: string,
): string {
  const dateOnlyMatch =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (dateOnlyMatch) {
    const [, year, month, day] =
      dateOnlyMatch;

    const localDate =
      new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
      );

    return new Intl.DateTimeFormat(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    ).format(localDate);
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(parsedDate);
}

function formatDateTime(
  value: string,
): string {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(parsedDate);
}

function getEventLabel(
  eventType: CareEventType,
): string {
  switch (eventType) {
    case "care_completed":
      return "Care recorded";

    case "reminder_snoozed":
      return "Care deferred";

    case "reminder_skipped":
      return "Care occurrence skipped";

    case "reminder_created":
      return "Care cadence created";

    case "reminder_updated":
      return "Care cadence updated";

    case "reminder_enabled":
      return "Care reminder enabled";

    case "reminder_disabled":
      return "Care reminder paused";
  }
}

function getEventDescription(
  event: CareEvent,
): string | null {
  switch (event.eventType) {
    case "care_completed":
      return event.nextDueAt
        ? `Next care recorded for ${formatDate(
            event.nextDueAt,
          )}.`
        : null;

    case "reminder_snoozed": {
      const snoozedUntil =
        typeof event.metadata?.snoozedUntil ===
        "string"
          ? event.metadata.snoozedUntil
          : undefined;

      return snoozedUntil
        ? `Deferred until ${formatDate(
            snoozedUntil,
          )}.`
        : "This care occurrence was temporarily deferred.";
    }

    case "reminder_skipped":
      return event.nextDueAt
        ? `Cadence advanced to ${formatDate(
            event.nextDueAt,
          )}.`
        : "The occurrence was skipped without recording care.";

    case "reminder_created":
    case "reminder_updated":
      return event.nextDueAt
        ? `Next care set for ${formatDate(
            event.nextDueAt,
          )}.`
        : null;

    case "reminder_enabled":
      return event.nextDueAt
        ? `Reminder resumed with next care on ${formatDate(
            event.nextDueAt,
          )}.`
        : "The care reminder was resumed.";

    case "reminder_disabled":
      return "The recurring care reminder was paused.";
  }
}

function getEventIcon(
  eventType: CareEventType,
) {
  switch (eventType) {
    case "care_completed":
      return (
        <CheckCircle2
          size={16}
          aria-hidden="true"
        />
      );

    case "reminder_snoozed":
      return (
        <CalendarClock
          size={16}
          aria-hidden="true"
        />
      );

    case "reminder_skipped":
      return (
        <SkipForward
          size={16}
          aria-hidden="true"
        />
      );

    case "reminder_created":
    case "reminder_updated":
      return (
        <RefreshCw
          size={16}
          aria-hidden="true"
        />
      );

    case "reminder_enabled":
      return (
        <Play
          size={16}
          aria-hidden="true"
        />
      );

    case "reminder_disabled":
      return (
        <Pause
          size={16}
          aria-hidden="true"
        />
      );
  }
}

export function CareHistory({
  specimenId,
  refreshToken = 0,
}: CareHistoryProps) {
  const [
    events,
    setEvents,
  ] = useState<CareEvent[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    manualRefreshToken,
    setManualRefreshToken,
  ] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      setIsLoading(true);
      setErrorMessage(null);

      const result =
        await loadSpecimenCareHistory(
          specimenId,
          25,
        );

      if (isCancelled) {
        return;
      }

      if (!result.success) {
        setEvents([]);
        setErrorMessage(
          result.error.message,
        );
        setIsLoading(false);
        return;
      }

      setEvents(result.data);
      setIsLoading(false);
    }

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [
    specimenId,
    refreshToken,
    manualRefreshToken,
  ]);

  return (
    <Surface className="p-6 sm:p-8">
      <section
        aria-labelledby={`care-history-${specimenId}-heading`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <History
                size={16}
                aria-hidden="true"
              />

              <p className="metadata-label">
                Stewardship history
              </p>
            </div>

            <h2
              id={`care-history-${specimenId}-heading`}
              className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
            >
              Recorded care activity
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              A chronological record of care
              completions and changes to this
              specimen&apos;s recurring cadence.
            </p>
          </div>

          <Button
            type="button"
            size="compact"
            variant="ghost"
            disabled={isLoading}
            leadingIcon={
              <RefreshCw
                size={15}
                aria-hidden="true"
              />
            }
            onClick={() => {
              setManualRefreshToken(
                (current) =>
                  current + 1,
              );
            }}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-7 border-t border-[var(--color-border)] pt-6">
          {isLoading ? (
            <p
              role="status"
              className="text-sm leading-6 text-[var(--color-text-secondary)]"
            >
              Retrieving stewardship history…
            </p>
          ) : null}

          {errorMessage ? (
            <p
              role="alert"
              className="text-sm leading-6 text-[var(--color-reminder-overdue)]"
            >
              {errorMessage}
            </p>
          ) : null}

          {!isLoading &&
          !errorMessage &&
          events.length === 0 ? (
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              No stewardship events have been
              recorded yet.
            </p>
          ) : null}

          {!isLoading &&
          !errorMessage &&
          events.length > 0 ? (
            <ol className="space-y-0">
              {events.map(
                (
                  event,
                  index,
                ) => {
                  const description =
                    getEventDescription(
                      event,
                    );

                  const isLast =
                    index ===
                    events.length - 1;

                  return (
                    <li
                      key={event.id}
                      className="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4"
                    >
                      {!isLast ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-[0.6875rem] top-7 h-[calc(100%-0.25rem)] w-px bg-[var(--color-border)]"
                        />
                      ) : null}

                      <div className="relative z-10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                        {getEventIcon(
                          event.eventType,
                        )}
                      </div>

                      <div className="pb-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                          <p className="text-sm font-medium leading-6 text-[var(--color-text-primary)]">
                            {getEventLabel(
                              event.eventType,
                            )}
                          </p>

                          <time
                            dateTime={
                              event.occurredAt
                            }
                            className="shrink-0 text-xs leading-5 text-[var(--color-text-muted)]"
                          >
                            {formatDateTime(
                              event.occurredAt,
                            )}
                          </time>
                        </div>

                        {description ? (
                          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                            {description}
                          </p>
                        ) : null}

                        {event.scheduledFor ? (
                          <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                            Scheduled occurrence:{" "}
                            {formatDate(
                              event.scheduledFor,
                            )}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                },
              )}
            </ol>
          ) : null}
        </div>
      </section>
    </Surface>
  );
}