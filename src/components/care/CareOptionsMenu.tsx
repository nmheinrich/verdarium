import { useMemo, useState } from "react";

import { CalendarClock, SkipForward } from "lucide-react";

import type { CareActionOutcome } from "@/care/useTileCare";
import { getSnoozeOptions } from "@/care/snoozeOptions";
import { Button } from "@/components/ui";
import type { SpecimenReminder } from "@/types";

interface CareOptionsMenuProps {
  reminder: SpecimenReminder;
  busy?: boolean;
  onSnooze: (snoozedUntil: string) => Promise<CareActionOutcome>;
  onSkip: () => Promise<CareActionOutcome>;
  onClose: () => void;
}

/**
 * Snooze and skip for one specimen, shown in the tile's care popover.
 * Snooze dates always fall after the current care date, which the
 * server requires.
 */
export function CareOptionsMenu({
  reminder,
  busy = false,
  onSnooze,
  onSkip,
  onClose,
}: CareOptionsMenuProps) {
  const [isConfirmingSkip, setIsConfirmingSkip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snoozeOptions = useMemo(
    () => getSnoozeOptions(reminder),
    [reminder],
  );

  const finish = (outcome: CareActionOutcome) => {
    if (outcome.ok) {
      onClose();
      return;
    }

    setError(outcome.message);
  };

  return (
    <div>
      {isConfirmingSkip ? (
        <>
          <p className="metadata-label text-[var(--color-text-secondary)]">
            Skip occurrence
          </p>
          <p className="mt-2 text-[0.8125rem] leading-5 text-[var(--color-text-secondary)]">
            The schedule moves to its next date. No care is recorded.
          </p>
          <div className="mt-3 flex justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setError(null);
                setIsConfirmingSkip(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="tonal"
              size="sm"
              loading={busy}
              onClick={() => {
                setError(null);
                void onSkip().then(finish);
              }}
            >
              Skip
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="metadata-label inline-flex items-center gap-1.5 text-[var(--color-text-secondary)]">
            <CalendarClock aria-hidden="true" size={13} strokeWidth={1.75} />
            Snooze until
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {snoozeOptions.map((option) => (
              <Button
                key={option.value}
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  void onSnooze(option.value).then(finish);
                }}
              >
                <time dateTime={option.value}>{option.label}</time>
              </Button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              leadingIcon={<SkipForward strokeWidth={1.75} />}
              onClick={() => {
                setError(null);
                setIsConfirmingSkip(true);
              }}
            >
              Skip occurrence
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-2.5 text-[0.8125rem] leading-5 text-[var(--color-reminder-overdue-ink)]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
