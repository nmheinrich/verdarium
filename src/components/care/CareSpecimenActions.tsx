import {
  addDays,
  format,
} from "date-fns";
import {
  CalendarClock,
  SkipForward,
  X,
} from "lucide-react";

import type { CareSpecimen } from "@/care/careSelectors";

import {
  Button,
  Input,
  Label,
  Surface,
} from "@/components/ui";

import {
  useMemo,
  useState,
} from "react";

interface CareSpecimenActionsProps {
  careSpecimen: CareSpecimen;
  isMutating?: boolean;
  onSnooze: (
    careSpecimen: CareSpecimen,
    snoozedUntil: string,
  ) => void;
  onRequestSkip: (
    careSpecimen: CareSpecimen,
  ) => void;
  onClose: () => void;
}

const DATE_FORMAT = "yyyy-MM-dd";

function getLocalDateValue(
  date: Date,
): string {
  return format(
    date,
    DATE_FORMAT,
  );
}

export function CareSpecimenActions({
  careSpecimen,
  isMutating = false,
  onSnooze,
  onRequestSkip,
  onClose,
}: CareSpecimenActionsProps) {
  const tomorrow =
    useMemo(
      () =>
        getLocalDateValue(
          addDays(
            new Date(),
            1,
          ),
        ),
      [],
    );

  const threeDays =
    useMemo(
      () =>
        getLocalDateValue(
          addDays(
            new Date(),
            3,
          ),
        ),
      [],
    );

  const oneWeek =
    useMemo(
      () =>
        getLocalDateValue(
          addDays(
            new Date(),
            7,
          ),
        ),
      [],
    );

  const [
    customDate,
    setCustomDate,
  ] = useState(
    careSpecimen.reminder.snoozedUntil ??
      tomorrow,
  );

  const specimenName =
    careSpecimen.specimen.commonName;

  function handleSnooze(
    snoozedUntil: string,
  ) {
    onSnooze(
      careSpecimen,
      snoozedUntil,
    );
  }

  return (
    <Surface
      variant="subtle"
      className="mt-3 p-5 sm:p-6"
    >
      <section
        aria-labelledby={`care-actions-${careSpecimen.specimen.id}-heading`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="metadata-label">
              Care options
            </p>

            <h4
              id={`care-actions-${careSpecimen.specimen.id}-heading`}
              className="mt-2 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
            >
              Adjust care for{" "}
              {specimenName}
            </h4>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Snoozing temporarily
              defers this occurrence
              without changing its
              underlying cadence.
              Skipping advances the
              schedule without
              recording care.
            </p>
          </div>

          <Button
            type="button"
            size="compact"
            variant="ghost"
            disabled={isMutating}
            leadingIcon={
              <X
                size={15}
                aria-hidden="true"
              />
            }
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center gap-2">
            <CalendarClock
              size={16}
              aria-hidden="true"
              className="text-[var(--color-text-muted)]"
            />

            <p className="metadata-label">
              Snooze
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="compact"
              variant="secondary"
              disabled={isMutating}
              onClick={() => {
                handleSnooze(
                  tomorrow,
                );
              }}
            >
              Tomorrow
            </Button>

            <Button
              type="button"
              size="compact"
              variant="secondary"
              disabled={isMutating}
              onClick={() => {
                handleSnooze(
                  threeDays,
                );
              }}
            >
              3 days
            </Button>

            <Button
              type="button"
              size="compact"
              variant="secondary"
              disabled={isMutating}
              onClick={() => {
                handleSnooze(
                  oneWeek,
                );
              }}
            >
              1 week
            </Button>
          </div>

          <div className="mt-5 max-w-sm">
            <Label
              htmlFor={`care-snooze-date-${careSpecimen.specimen.id}`}
            >
              Choose date
            </Label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Input
                id={`care-snooze-date-${careSpecimen.specimen.id}`}
                type="date"
                min={tomorrow}
                value={
                  customDate
                }
                disabled={
                  isMutating
                }
                onChange={(
                  event,
                ) => {
                  setCustomDate(
                    event.target
                      .value,
                  );
                }}
              />

              <Button
                type="button"
                variant="secondary"
                disabled={
                  isMutating ||
                  !customDate
                }
                onClick={() => {
                  handleSnooze(
                    customDate,
                  );
                }}
              >
                Snooze
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center gap-2">
            <SkipForward
              size={16}
              aria-hidden="true"
              className="text-[var(--color-text-muted)]"
            />

            <p className="metadata-label">
              Skip occurrence
            </p>
          </div>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Skip this scheduled
            occurrence and advance to
            the next date in the
            existing cadence. No care
            completion will be
            recorded.
          </p>

          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              disabled={isMutating}
              onClick={() => {
                onRequestSkip(
                  careSpecimen,
                );
              }}
            >
              Skip this occurrence
            </Button>
          </div>
        </div>
      </section>
    </Surface>
  );
}