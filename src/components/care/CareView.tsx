import {
  useState,
} from "react";

import {
  CalendarDays,
  Leaf,
} from "lucide-react";

import {
  createCareOverview,
  getCareAttentionCount,
  getNextCareSpecimen,
  type CareSpecimen,
} from "@/care/careSelectors";
import {
  recordCare,
  skipCare,
  snoozeCare,
} from "@/care/careService";
import { useLocalDateRollover } from "@/care/useLocalDateRollover";

import {
  Button,
  Surface,
} from "@/components/ui";

import type {
  Specimen,
  SpecimenReminder,
} from "@/types";

import { CareSpecimenActions } from "./CareSpecimenActions";
import { CareSpecimenCard } from "./CareSpecimenCard";

interface CareViewProps {
  specimens: Specimen[];
  onReminderChange: (
    specimenId: string,
    reminder: SpecimenReminder,
  ) => void;
  onOpenSpecimen: (
    specimen: Specimen,
  ) => void;
  onBrowseCollection: () => void;
}

function getLocalDateValue(
  date = new Date(),
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCareDate(
  value: string,
): string {
  const [year, month, day] =
    value.split("-").map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    undefined,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function getRecordActionKey(
  specimenId: string,
): string {
  return `record:${specimenId}`;
}

function getSnoozeActionKey(
  specimenId: string,
  snoozedUntil: string,
): string {
  return `snooze:${specimenId}:${snoozedUntil}`;
}

function getSkipActionKey(
  specimenId: string,
): string {
  return `skip:${specimenId}`;
}

export function CareView({
  specimens,
  onReminderChange,
  onOpenSpecimen,
  onBrowseCollection,
}: CareViewProps) {
  useLocalDateRollover();

    const overview =
    createCareOverview(
        specimens,
        new Date(),
    );

  const attentionCount =
    getCareAttentionCount(overview);

  const nextCare =
    getNextCareSpecimen(overview);

  const [
    mutatingSpecimenId,
    setMutatingSpecimenId,
  ] = useState<string | null>(null);

  const [
    openActionsSpecimenId,
    setOpenActionsSpecimenId,
  ] = useState<string | null>(null);

  const [
    pendingSkipSpecimen,
    setPendingSkipSpecimen,
  ] = useState<CareSpecimen | null>(
    null,
  );

  const [
    retryActionIds,
    setRetryActionIds,
  ] = useState<
    Record<string, string>
  >({});

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    statusMessage,
    setStatusMessage,
  ] = useState<string | null>(
    null,
  );

  function getOrCreateActionId(
    actionKey: string,
  ): string {
    const existingActionId =
      retryActionIds[actionKey];

    if (existingActionId) {
      return existingActionId;
    }

    const actionId =
      crypto.randomUUID();

    setRetryActionIds(
      (current) => ({
        ...current,
        [actionKey]: actionId,
      }),
    );

    return actionId;
  }

  function clearActionId(
    actionKey: string,
  ) {
    setRetryActionIds(
      (current) => {
        const next = {
          ...current,
        };

        delete next[actionKey];

        return next;
      },
    );
  }

  async function handleRecordCare(
    careSpecimen: CareSpecimen,
  ) {
    if (mutatingSpecimenId) {
      return;
    }

    const specimenId =
      careSpecimen.specimen.id;

    const actionKey =
      getRecordActionKey(
        specimenId,
      );

    const actionId =
      getOrCreateActionId(
        actionKey,
      );

    setMutatingSpecimenId(
      specimenId,
    );

    setErrorMessage(null);
    setStatusMessage(null);

    const result =
      await recordCare({
        actionId,
        specimenId,
        completedAt:
          getLocalDateValue(),
      });

    if (!result.success) {
      setErrorMessage(
        result.error.message,
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    if (!result.data.reminder) {
      setErrorMessage(
        "Verdarium recorded the care event but could not read the updated care cadence.",
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    onReminderChange(
      specimenId,
      result.data.reminder,
    );

    clearActionId(actionKey);

    setOpenActionsSpecimenId(
      null,
    );

    setPendingSkipSpecimen(
      null,
    );

    setMutatingSpecimenId(
      null,
    );

    setStatusMessage(
      result.data.reminder.nextDueAt
        ? `Care recorded for ${careSpecimen.specimen.commonName}. Next care is ${formatCareDate(
            result.data.reminder.nextDueAt,
          )}.`
        : `Care recorded for ${careSpecimen.specimen.commonName}.`,
    );
  }

  async function handleSnooze(
    careSpecimen: CareSpecimen,
    snoozedUntil: string,
  ) {
    if (mutatingSpecimenId) {
      return;
    }

    const specimenId =
      careSpecimen.specimen.id;

    const actionKey =
      getSnoozeActionKey(
        specimenId,
        snoozedUntil,
      );

    const actionId =
      getOrCreateActionId(
        actionKey,
      );

    setMutatingSpecimenId(
      specimenId,
    );

    setErrorMessage(null);
    setStatusMessage(null);

    const result =
      await snoozeCare({
        actionId,
        specimenId,
        snoozedUntil,
      });

    if (!result.success) {
      setErrorMessage(
        result.error.message,
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    if (!result.data.reminder) {
      setErrorMessage(
        "Verdarium deferred the care occurrence but could not read the updated reminder.",
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    onReminderChange(
      specimenId,
      result.data.reminder,
    );

    clearActionId(actionKey);

    setOpenActionsSpecimenId(
      null,
    );

    setPendingSkipSpecimen(
      null,
    );

    setMutatingSpecimenId(
      null,
    );

    setStatusMessage(
      `Care for ${careSpecimen.specimen.commonName} is deferred until ${formatCareDate(
        snoozedUntil,
      )}.`,
    );
  }

  async function handleConfirmSkip() {
    if (
      !pendingSkipSpecimen ||
      mutatingSpecimenId
    ) {
      return;
    }

    const specimenId =
      pendingSkipSpecimen.specimen.id;

    const actionKey =
      getSkipActionKey(
        specimenId,
      );

    const actionId =
      getOrCreateActionId(
        actionKey,
      );

    setMutatingSpecimenId(
      specimenId,
    );

    setErrorMessage(null);
    setStatusMessage(null);

    const result =
      await skipCare({
        actionId,
        specimenId,
      });

    if (!result.success) {
      setErrorMessage(
        result.error.message,
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    if (!result.data.reminder) {
      setErrorMessage(
        "Verdarium skipped the care occurrence but could not read the updated reminder.",
      );

      setMutatingSpecimenId(
        null,
      );

      return;
    }

    const specimenName =
      pendingSkipSpecimen
        .specimen.commonName;

    const nextDueAt =
      result.data.reminder.nextDueAt;

    onReminderChange(
      specimenId,
      result.data.reminder,
    );

    clearActionId(actionKey);

    setPendingSkipSpecimen(
      null,
    );

    setOpenActionsSpecimenId(
      null,
    );

    setMutatingSpecimenId(
      null,
    );

    setStatusMessage(
      nextDueAt
        ? `This care occurrence for ${specimenName} was skipped. Next care is ${formatCareDate(
            nextDueAt,
          )}.`
        : `This care occurrence for ${specimenName} was skipped.`,
    );
  }

  function handleOpenActions(
    careSpecimen: CareSpecimen,
  ) {
    setErrorMessage(null);
    setStatusMessage(null);

    setOpenActionsSpecimenId(
      (current) =>
        current ===
        careSpecimen.specimen.id
          ? null
          : careSpecimen.specimen.id,
    );
  }

  function handleRequestSkip(
    careSpecimen: CareSpecimen,
  ) {
    setErrorMessage(null);
    setStatusMessage(null);

    setPendingSkipSpecimen(
      careSpecimen,
    );
  }

  function handleCancelSkip() {
    if (mutatingSpecimenId) {
      return;
    }

    setPendingSkipSpecimen(
      null,
    );

    setErrorMessage(null);
  }

  function renderCareGroup(
    title: string,
    description: string,
    careSpecimens: CareSpecimen[],
  ) {
    if (
      careSpecimens.length === 0
    ) {
      return null;
    }

    const headingId =
      `care-${title
        .toLowerCase()
        .replace(/\s+/g, "-")}-heading`;

    return (
      <section
        aria-labelledby={
          headingId
        }
        className="mt-10"
      >
        <div className="mb-5 flex items-end justify-between gap-6 border-b border-[var(--color-border)] pb-4">
          <div>
            <p className="metadata-label">
              {title}
            </p>

            <h2
              id={headingId}
              className="mt-2 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
            >
              {description}
            </h2>
          </div>

          <p className="text-sm text-[var(--color-text-muted)]">
            {careSpecimens.length}
          </p>
        </div>

        <div className="space-y-5">
          {careSpecimens.map(
            (careSpecimen) => {
              const specimenId =
                careSpecimen
                  .specimen.id;

              const isMutating =
                mutatingSpecimenId ===
                specimenId;

              const actionsAreOpen =
                openActionsSpecimenId ===
                specimenId;

              return (
                <div
                  key={specimenId}
                >
                  <CareSpecimenCard
                    careSpecimen={
                      careSpecimen
                    }
                    isMutating={
                      isMutating
                    }
                    onRecordCare={(
                      selectedCareSpecimen,
                    ) => {
                      void handleRecordCare(
                        selectedCareSpecimen,
                      );
                    }}
                    onOpenActions={
                      handleOpenActions
                    }
                  />

                  {actionsAreOpen ? (
                    <CareSpecimenActions
                      careSpecimen={
                        careSpecimen
                      }
                      isMutating={
                        isMutating
                      }
                      onSnooze={(
                        selectedCareSpecimen,
                        snoozedUntil,
                      ) => {
                        void handleSnooze(
                          selectedCareSpecimen,
                          snoozedUntil,
                        );
                      }}
                      onRequestSkip={
                        handleRequestSkip
                      }
                      onClose={() => {
                        setOpenActionsSpecimenId(
                          null,
                        );
                      }}
                    />
                  ) : null}
                </div>
              );
            },
          )}
        </div>
      </section>
    );
  }

  const hasAnyCareReminders =
    overview.overdue.length > 0 ||
    overview.today.length > 0 ||
    overview.upcoming.length > 0 ||
    overview.later.length > 0;

  if (
    !hasAnyCareReminders
  ) {
    return (
      <Surface
        variant="subtle"
        className="mt-8 p-8 sm:p-10"
      >
        <section
          aria-labelledby="care-empty-heading"
          className="max-w-2xl"
        >
          <Leaf
            aria-hidden="true"
            size={18}
            strokeWidth={1.75}
            className="text-[var(--color-text-muted)]"
          />

          <p className="metadata-label mt-5">
            Botanical stewardship
          </p>

          <h2
            id="care-empty-heading"
            className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)]"
          >
            No care rhythms have been
            recorded yet
          </h2>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Recurring care reminders can
            preserve the cadence of tending
            your specimens without turning
            Verdarium into a task list.
          </p>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={
                onBrowseCollection
              }
            >
              Browse collection
            </Button>
          </div>
        </section>
      </Surface>
    );
  }

  return (
    <div className="mt-8">
      <Surface
        variant="subtle"
        className="p-6 sm:p-8"
      >
        <section
          aria-labelledby="care-overview-heading"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Leaf
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.75}
                />

                <p className="metadata-label">
                  Botanical stewardship
                </p>
              </div>

              <h2
                id="care-overview-heading"
                className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)]"
              >
                {attentionCount > 0
                  ? `${attentionCount} ${
                      attentionCount === 1
                        ? "specimen needs"
                        : "specimens need"
                    } attention`
                  : "The collection is settled"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {attentionCount > 0
                  ? "Care that is due or overdue is gathered here, with upcoming rhythms preserved quietly below."
                  : "No care is due today. Verdarium will continue to surface each specimen when its recorded cadence arrives."}
              </p>
            </div>

            {nextCare ? (
              <div className="shrink-0 sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <CalendarDays
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.75}
                    className="text-[var(--color-text-muted)]"
                  />

                  <p className="metadata-label">
                    Next care
                  </p>
                </div>

                <p className="mt-2 font-serif text-xl text-[var(--color-text-primary)]">
                  {
                    nextCare.specimen
                      .commonName
                  }
                </p>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {formatCareDate(
                    nextCare.effectiveDueAt,
                  )}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </Surface>

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

      {pendingSkipSpecimen ? (
        <Surface
          variant="subtle"
          className="mt-6 p-5 sm:p-6"
        >
          <section
            aria-labelledby="skip-care-confirmation-heading"
          >
            <p className="metadata-label">
              Confirmation required
            </p>

            <h2
              id="skip-care-confirmation-heading"
              className="mt-2 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
            >
              Skip care for{" "}
              {
                pendingSkipSpecimen
                  .specimen.commonName
              }
              ?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
              This will advance the
              existing care cadence
              without recording a care
              completion. The skipped
              occurrence will remain in
              the stewardship history.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="compact"
                variant="secondary"
                disabled={
                  mutatingSpecimenId !==
                  null
                }
                onClick={
                  handleCancelSkip
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="compact"
                variant="secondary"
                disabled={
                  mutatingSpecimenId !==
                  null
                }
                onClick={() => {
                  onOpenSpecimen(
                    pendingSkipSpecimen.specimen,
                  );
                }}
              >
                Open specimen
              </Button>

              <Button
                type="button"
                size="compact"
                disabled={
                  mutatingSpecimenId !==
                  null
                }
                onClick={() => {
                  void handleConfirmSkip();
                }}
              >
                {mutatingSpecimenId ===
                pendingSkipSpecimen.specimen.id
                  ? "Skipping…"
                  : "Confirm skip"}
              </Button>
            </div>
          </section>
        </Surface>
      ) : null}

      {renderCareGroup(
        "Overdue",
        "Care awaiting attention",
        overview.overdue,
      )}

      {renderCareGroup(
        "Today",
        "Care due today",
        overview.today,
      )}

      {renderCareGroup(
        "Upcoming",
        "The next fourteen days",
        overview.upcoming,
      )}

      {renderCareGroup(
        "Later",
        "Recorded future care",
        overview.later,
      )}
    </div>
  );
}