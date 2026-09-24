import { useEffect, useId, useState } from "react";

import { format } from "date-fns";
import {
  CalendarClock,
  Check,
  Leaf,
  PencilLine,
  Undo2,
} from "lucide-react";

import { useTileCareController } from "@/care/useTileCare";
import { CareNoteForm } from "@/components/cards";
import { Badge, Button, Surface } from "@/components/ui";
import {
  cn,
  getCareStateLabel,
  getEffectiveReminderDueAt,
} from "@/lib";
import type { Specimen } from "@/types";

import { CareOptionsMenu } from "./CareOptionsMenu";

interface SpecimenCarePanelProps {
  specimen: Specimen;
}

function formatDate(value: string, pattern: string): string {
  const [year, month, day] = value.split("-").map(Number);

  return format(new Date(year, month - 1, day), pattern);
}

/**
 * Care for one specimen on its record (spec 001): current state, Record
 * care with Undo and a note, and snooze or skip. Shares the pending
 * records of the tiles, so a record started on a tile shows here too.
 */
export function SpecimenCarePanel({ specimen }: SpecimenCarePanelProps) {
  const care = useTileCareController();
  const headingId = useId();
  const noteId = useId();
  const optionsId = useId();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const setCareNoteOpen = care?.setNoteOpen;
  const specimenId = specimen.id;
  const isNoteShown = isNoteOpen && Boolean(care?.pending[specimenId]);

  // Resume a paused commit if the panel goes away with the note open.
  useEffect(() => {
    if (!isNoteShown || !setCareNoteOpen) {
      return;
    }

    return () => setCareNoteOpen(specimenId, false);
  }, [isNoteShown, setCareNoteOpen, specimenId]);

  const reminder = specimen.reminder;
  const careState = getCareStateLabel(reminder);

  if (!care || !reminder || !careState) {
    return null;
  }

  const pending = care.pending[specimen.id];
  const busy = Boolean(care.busy[specimen.id]);
  const message = care.messages[specimen.id];
  const effectiveDueAt = getEffectiveReminderDueAt(reminder);
  const isDue =
    careState.status === "due" || careState.status === "overdue";

  const setNoteOpen = (open: boolean) => {
    setIsNoteOpen(open);
    care.setNoteOpen(specimen.id, open);
  };

  return (
    <Surface className="p-6 sm:p-8">
      <section aria-labelledby={headingId}>
        <p className="metadata-label">Stewardship</p>
        <h2
          id={headingId}
          className="mt-3 font-display type-title text-[var(--color-text-primary)]"
        >
          Care
        </h2>

        <dl className="mt-6 grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-3">
          <div>
            <dt className="metadata-label text-[var(--color-text-muted)]">
              State
            </dt>
            <dd className="mt-2">
              <Badge variant={careState.status}>{careState.label}</Badge>
            </dd>
          </div>
          {effectiveDueAt ? (
            <div>
              <dt className="metadata-label text-[var(--color-text-muted)]">
                {reminder.snoozedUntil ? "Snoozed until" : "Next care"}
              </dt>
              <dd className="mt-2 text-sm text-[var(--color-text-primary)]">
                <time dateTime={effectiveDueAt}>
                  {formatDate(effectiveDueAt, "EEE, MMM d, yyyy")}
                </time>
              </dd>
            </div>
          ) : null}
          {reminder.lastCompletedAt ? (
            <div>
              <dt className="metadata-label text-[var(--color-text-muted)]">
                Last care recorded
              </dt>
              <dd className="mt-2 text-sm text-[var(--color-text-primary)]">
                <time dateTime={reminder.lastCompletedAt}>
                  {formatDate(reminder.lastCompletedAt, "MMM d, yyyy")}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-6">
          {pending ? (
            <>
              <span
                role="status"
                className="mr-auto inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]"
              >
                <Check
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.75}
                  className="text-[var(--color-botanical)]"
                />
                {`Recorded · ${formatDate(pending.completedAt, "MMM d")}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<PencilLine strokeWidth={1.75} />}
                aria-expanded={isNoteShown}
                aria-controls={noteId}
                onClick={() => setNoteOpen(!isNoteShown)}
              >
                {pending.note ? "Edit note" : "Add note"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={<Undo2 strokeWidth={1.75} />}
                onClick={() => {
                  setIsNoteOpen(false);
                  care.undo(specimen.id);
                }}
              >
                Undo
              </Button>
            </>
          ) : (
            <>
              {isDue ? (
                <Button
                  variant="tonal"
                  leadingIcon={<Leaf strokeWidth={1.75} />}
                  disabled={busy}
                  onClick={() => {
                    setIsOptionsOpen(false);
                    setIsNoteOpen(false);
                    care.recordCare(specimen);
                  }}
                >
                  Record care
                </Button>
              ) : null}
              <Button
                variant="secondary"
                leadingIcon={<CalendarClock strokeWidth={1.75} />}
                disabled={busy}
                aria-expanded={isOptionsOpen}
                aria-controls={optionsId}
                onClick={() => setIsOptionsOpen((open) => !open)}
              >
                Snooze or skip
              </Button>
            </>
          )}
        </div>

        {pending && isNoteShown ? (
          <CareNoteForm
            key={pending.actionId}
            id={noteId}
            initialNote={pending.note}
            onSave={(note) => {
              care.setNote(specimen.id, note);
              setNoteOpen(false);
            }}
            onCancel={() => setNoteOpen(false)}
            className="mt-4 max-w-md"
          />
        ) : null}

        {!pending && isOptionsOpen ? (
          <div
            id={optionsId}
            className="mt-4 max-w-md rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3.5 shadow-[var(--shadow-elevated)]"
          >
            <CareOptionsMenu
              reminder={reminder}
              busy={busy}
              onSnooze={(snoozedUntil) =>
                care.snooze(specimen, snoozedUntil)
              }
              onSkip={() => care.skip(specimen)}
              onClose={() => setIsOptionsOpen(false)}
            />
          </div>
        ) : null}

        {message ? (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={cn(
              "mt-4 text-sm leading-6",
              message.tone === "error"
                ? "text-[var(--color-reminder-overdue-ink)]"
                : "text-[var(--color-text-secondary)]",
            )}
          >
            {message.text}
          </p>
        ) : null}
      </section>
    </Surface>
  );
}
