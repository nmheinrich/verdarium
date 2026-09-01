import { Star } from "lucide-react";

import { REMINDER_STATUS_LABELS } from "@/constants";
import { Surface } from "@/components/ui";
import { getReminderStatus } from "@/lib";
import type { Specimen } from "@/types";

interface CompactSpecimenCardProps {
  specimen: Specimen;
}

function formatHealthStatus(
  healthStatus: Specimen["healthStatus"],
): string {
  return healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);
}

function formatLocation(specimen: Specimen): string | null {
  const locationParts = [
    specimen.location?.room,
    specimen.location?.position,
  ].filter(Boolean);

  return locationParts.length > 0
    ? locationParts.join(" · ")
    : null;
}

function getReminderTextClass(
  status: "upcoming" | "due" | "overdue",
): string {
  switch (status) {
    case "upcoming":
      return "bg-[var(--color-reminder-upcoming)] text-[var(--color-text-secondary)]";

    case "due":
      return "bg-[var(--color-reminder-due)] text-[var(--color-text-primary)]";

    case "overdue":
      return "bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]";
  }
}

export function CompactSpecimenCard({
  specimen,
}: CompactSpecimenCardProps) {
  const location = formatLocation(specimen);
  const reminderStatus = getReminderStatus(specimen.reminder);

  return (
    <article
      aria-labelledby={`compact-specimen-${specimen.id}-name`}
      className="h-full"
    >
      <Surface className="flex h-full flex-col overflow-hidden">
        <div className="relative flex min-h-32 items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
          <div className="flex flex-col items-center text-center">
            <p className="metadata-label">Botanical plate</p>

            <div
              aria-hidden="true"
              className="mt-4 h-12 w-px bg-[var(--color-border-strong)]"
            />
          </div>

          {specimen.isFavorite ? (
            <div className="absolute right-4 top-4 text-[var(--color-botanical)]">
              <Star
                aria-hidden="true"
                size={14}
                strokeWidth={1.75}
              />

              <span className="visually-hidden">
                Favorite specimen
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div>
            <p className="metadata-label">
              Collection specimen
            </p>

            <h2
              id={`compact-specimen-${specimen.id}-name`}
              className="mt-2 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
            >
              {specimen.commonName}
            </h2>

            <p className="scientific-name mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              {specimen.scientificName}
            </p>
          </div>

          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-5 text-[var(--color-text-secondary)]">
              <span>
                {formatHealthStatus(specimen.healthStatus)}
              </span>

              {location ? (
                <>
                  <span
                    aria-hidden="true"
                    className="text-[var(--color-border-strong)]"
                  >
                    ·
                  </span>

                  <span>{location}</span>
                </>
              ) : null}

              {reminderStatus !== "none" ? (
                <>
                  <span
                    aria-hidden="true"
                    className="text-[var(--color-border-strong)]"
                  >
                    ·
                  </span>

                  <span
                    className={`rounded-[var(--radius-sm)] px-1.5 py-0.5 ${getReminderTextClass(
                      reminderStatus,
                    )}`}
                  >
                    {REMINDER_STATUS_LABELS[reminderStatus]}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </Surface>
    </article>
  );
}