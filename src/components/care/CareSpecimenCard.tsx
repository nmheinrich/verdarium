import {
  Clock3,
  Ellipsis,
} from "lucide-react";

import { BotanicalIllustration } from "@/components/illustrations/BotanicalIllustration";
import {
  Button,
  Surface,
} from "@/components/ui";

import type { CareSpecimen } from "@/care/careSelectors";

interface CareSpecimenCardProps {
  careSpecimen: CareSpecimen;
  isMutating?: boolean;
  onRecordCare: (
    careSpecimen: CareSpecimen,
  ) => void;
  onOpenActions: (
    careSpecimen: CareSpecimen,
  ) => void;
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
      month: "short",
      day: "numeric",
    },
  ).format(date);
}

function formatFrequency(
  careSpecimen: CareSpecimen,
): string {
  const {
    interval,
    unit,
  } = careSpecimen.reminder.frequency;

  const unitLabel =
    interval === 1
      ? unit
      : `${unit}s`;

  return `Every ${interval} ${unitLabel}`;
}

function getDueLabel(
  careSpecimen: CareSpecimen,
): string {
  switch (careSpecimen.group) {
    case "overdue":
      return `Care was due ${formatCareDate(
        careSpecimen.effectiveDueAt,
      )}`;

    case "today":
      return "Care due today";

    case "upcoming":
    case "later":
      return `Next care ${formatCareDate(
        careSpecimen.effectiveDueAt,
      )}`;

    default:
      return "Care schedule";
  }
}

export function CareSpecimenCard({
  careSpecimen,
  isMutating = false,
  onRecordCare,
  onOpenActions,
}: CareSpecimenCardProps) {
  const {
    specimen,
    reminder,
  } = careSpecimen;

  return (
    <article
      aria-labelledby={`care-specimen-${specimen.id}-name`}
    >
      <Surface className="overflow-hidden">
        <div className="grid gap-0 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <div className="border-b border-[var(--color-border)] sm:border-b-0 sm:border-r">
            <BotanicalIllustration
              illustrationKey={
                specimen.illustrationKey
              }
              presentation="card"
              className="min-h-48 border-0 sm:h-full sm:min-h-56"
            />
          </div>

          <div className="flex min-w-0 flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="metadata-label">
                  Botanical stewardship
                </p>

                <h3
                  id={`care-specimen-${specimen.id}-name`}
                  className="mt-2 break-words font-display type-title text-[var(--color-text-primary)]"
                >
                  {specimen.commonName}
                </h3>

                <p className="scientific-name mt-1 break-words text-sm leading-6 text-[var(--color-text-secondary)]">
                  {specimen.scientificName}
                </p>
              </div>

              <Button
                type="button"
                size="compact"
                variant="ghost"
                disabled={isMutating}
                leadingIcon={
                  <Ellipsis
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={() => {
                  onOpenActions(
                    careSpecimen,
                  );
                }}
              >
                Options
              </Button>
            </div>

            <div className="mt-5 flex items-start gap-3 border-t border-[var(--color-border)] pt-5">
              <Clock3
                aria-hidden="true"
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
              />

              <div>
                <p className="text-sm leading-6 text-[var(--color-text-primary)]">
                  {getDueLabel(
                    careSpecimen,
                  )}
                </p>

                <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">
                  {formatFrequency(
                    careSpecimen,
                  )}
                </p>

                {reminder.snoozedUntil ? (
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                    Temporarily deferred from{" "}
                    {formatCareDate(
                      reminder.nextDueAt ??
                        careSpecimen.effectiveDueAt,
                    )}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                disabled={isMutating}
                onClick={() => {
                  onRecordCare(
                    careSpecimen,
                  );
                }}
              >
                {isMutating
                  ? "Recording care…"
                  : "Record care"}
              </Button>
            </div>
          </div>
        </div>
      </Surface>
    </article>
  );
}