import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Pause,
  Play,
} from "lucide-react";

import {
  Button,
  Input,
  Label,
  Surface,
} from "@/components/ui";

import {
  configureCareReminder,
  setCareReminderEnabled,
} from "@/care/careService";

import type {
  ReminderFrequencyUnit,
  Specimen,
  SpecimenReminder,
} from "@/types";

interface CareReminderFormProps {
  specimen: Specimen;
  onReminderChange: (
    reminder: SpecimenReminder,
  ) => void;
}

type PendingAction =
  | "configure"
  | "enable"
  | "disable"
  | null;

const FREQUENCY_UNITS: Array<{
  value: ReminderFrequencyUnit;
  label: string;
}> = [
  {
    value: "day",
    label: "days",
  },
  {
    value: "week",
    label: "weeks",
  },
  {
    value: "month",
    label: "months",
  },
];

function createActionId(): string {
  return crypto.randomUUID();
}

function getTodayDateValue(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CareReminderForm({
  specimen,
  onReminderChange,
}: CareReminderFormProps) {
  const existingReminder =
    specimen.reminder;

  const [
    interval,
    setInterval,
  ] = useState(
    existingReminder?.frequency.interval.toString() ??
      "7",
  );

  const [
    unit,
    setUnit,
  ] = useState<ReminderFrequencyUnit>(
    existingReminder?.frequency.unit ??
      "day",
  );

  const [
    nextDueAt,
    setNextDueAt,
  ] = useState(
    existingReminder?.nextDueAt ??
      getTodayDateValue(),
  );

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction>(null);

  const [
    retryActionId,
    setRetryActionId,
  ] = useState<string | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState<string | null>(null);

  const parsedInterval =
    Number.parseInt(
      interval,
      10,
    );

  const hasValidInterval =
    Number.isInteger(parsedInterval) &&
    parsedInterval > 0;

  const hasValidNextDueAt =
    nextDueAt.length > 0;

  const hasConfiguration =
    existingReminder !== undefined;

  const isEnabled =
    existingReminder?.enabled ??
    false;

  const hasChanges = useMemo(() => {
    if (!existingReminder) {
      return true;
    }

    return (
      parsedInterval !==
        existingReminder.frequency.interval ||
      unit !==
        existingReminder.frequency.unit ||
      nextDueAt !==
        (existingReminder.nextDueAt ?? "")
    );
  }, [
    existingReminder,
    parsedInterval,
    unit,
    nextDueAt,
  ]);

  const isBusy =
    pendingAction !== null;

  function resetMutationFeedback() {
    setErrorMessage(null);
    setStatusMessage(null);
    setRetryActionId(null);
  }

  async function handleSaveReminder() {
    if (
      !hasValidInterval ||
      !hasValidNextDueAt
    ) {
      setErrorMessage(
        "Enter a valid care interval and next care date.",
      );
      return;
    }

    setPendingAction("configure");
    setErrorMessage(null);
    setStatusMessage(null);

    const actionId =
      retryActionId ??
      createActionId();

    setRetryActionId(actionId);

    const result =
      await configureCareReminder({
        actionId,
        specimenId: specimen.id,
        frequency: {
          interval: parsedInterval,
          unit,
        },
        nextDueAt,
      });

    if (!result.success) {
      setErrorMessage(
        result.error.message,
      );
      setPendingAction(null);
      return;
    }

    if (!result.data.reminder) {
      setErrorMessage(
        "Verdarium saved the care record but could not read the updated reminder.",
      );
      setPendingAction(null);
      return;
    }

    onReminderChange(
      result.data.reminder,
    );

    setRetryActionId(null);
    setPendingAction(null);
    setStatusMessage(
      hasConfiguration
        ? "Care cadence updated."
        : "Care cadence recorded.",
    );
  }

  async function handleSetEnabled(
    enabled: boolean,
  ) {
    setPendingAction(
      enabled
        ? "enable"
        : "disable",
    );
    setErrorMessage(null);
    setStatusMessage(null);

    const actionId =
      retryActionId ??
      createActionId();

    setRetryActionId(actionId);

    const result =
      await setCareReminderEnabled({
        actionId,
        specimenId: specimen.id,
        enabled,
        ...(enabled
          ? {
              nextDueAt,
            }
          : {}),
      });

    if (!result.success) {
      setErrorMessage(
        result.error.message,
      );
      setPendingAction(null);
      return;
    }

    if (!result.data.reminder) {
      setErrorMessage(
        "Verdarium saved the care record but could not read the updated reminder.",
      );
      setPendingAction(null);
      return;
    }

    onReminderChange(
      result.data.reminder,
    );

    setRetryActionId(null);
    setPendingAction(null);
    setStatusMessage(
      enabled
        ? "Care reminder enabled."
        : "Care reminder paused.",
    );
  }

  return (
    <Surface className="p-6 sm:p-8">
      <section
        aria-labelledby={`care-reminder-${specimen.id}-heading`}
      >
        <div className="max-w-2xl">
          <p className="metadata-label">
            Care cadence
          </p>

          <h2
            id={`care-reminder-${specimen.id}-heading`}
            className="mt-3 font-display type-title text-[var(--color-text-primary)]"
          >
            Recurring care reminder
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Record a gentle recurring rhythm
            for tending this specimen.
            Verdarium will surface the next
            care date without turning the
            collection into a task list.
          </p>
        </div>

        <div className="mt-7 grid gap-5 border-t border-[var(--color-border)] pt-6 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
          <div>
            <Label htmlFor={`care-interval-${specimen.id}`}>
              Repeat every
            </Label>

            <Input
              id={`care-interval-${specimen.id}`}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className="mt-2"
              value={interval}
              disabled={isBusy}
              onChange={(event) => {
                setInterval(
                  event.target.value,
                );
                resetMutationFeedback();
              }}
            />
          </div>

          <div>
            <Label htmlFor={`care-unit-${specimen.id}`}>
              Interval
            </Label>

            <select
              id={`care-unit-${specimen.id}`}
              value={unit}
              disabled={isBusy}
              className="mt-2 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-primary)] transition-[background-color,border-color,color] duration-[var(--transition-base)] ease-[var(--ease-standard)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:bg-[var(--color-background)] disabled:text-[var(--color-text-muted)] disabled:opacity-70"
              onChange={(event) => {
                setUnit(
                  event.target
                    .value as ReminderFrequencyUnit,
                );
                resetMutationFeedback();
              }}
            >
              {FREQUENCY_UNITS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor={`care-next-date-${specimen.id}`}>
            Next care
          </Label>

          <div className="mt-2 max-w-sm">
            <Input
              id={`care-next-date-${specimen.id}`}
              type="date"
              value={nextDueAt}
              disabled={isBusy}
              onChange={(event) => {
                setNextDueAt(
                  event.target.value,
                );
                resetMutationFeedback();
              }}
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            This date begins or resets the
            recurring care cadence.
          </p>
        </div>

        {existingReminder?.lastCompletedAt ? (
          <dl className="mt-6 border-t border-[var(--color-border)] pt-5">
            <div>
              <dt className="metadata-label">
                Last care recorded
              </dt>

              <dd className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                {
                  existingReminder.lastCompletedAt
                }
              </dd>
            </div>
          </dl>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 text-sm leading-6 text-[var(--color-reminder-overdue)]"
          >
            {errorMessage}
          </p>
        ) : null}

        {statusMessage ? (
          <p
            role="status"
            className="mt-6 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-6">
          <Button
            type="button"
            disabled={
              isBusy ||
              !hasValidInterval ||
              !hasValidNextDueAt ||
              (
                hasConfiguration &&
                !hasChanges
              )
            }
            leadingIcon={
              <CalendarDays
                size={16}
                aria-hidden="true"
              />
            }
            onClick={() => {
              void handleSaveReminder();
            }}
          >
            {pendingAction ===
            "configure"
              ? "Saving cadence…"
              : hasConfiguration
                ? "Save care cadence"
                : "Add care reminder"}
          </Button>

          {hasConfiguration ? (
            isEnabled ? (
              <Button
                type="button"
                variant="secondary"
                disabled={isBusy}
                leadingIcon={
                  <Pause
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={() => {
                  void handleSetEnabled(
                    false,
                  );
                }}
              >
                {pendingAction ===
                "disable"
                  ? "Pausing…"
                  : "Pause reminder"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                disabled={
                  isBusy ||
                  !hasValidNextDueAt
                }
                leadingIcon={
                  <Play
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={() => {
                  void handleSetEnabled(
                    true,
                  );
                }}
              >
                {pendingAction ===
                "enable"
                  ? "Enabling…"
                  : "Enable reminder"}
              </Button>
            )
          ) : null}
        </div>
      </section>
    </Surface>
  );
}