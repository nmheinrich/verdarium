import { Star } from "lucide-react";

import { REMINDER_STATUS_LABELS } from "@/constants";
import { Badge, Surface } from "@/components/ui";
import { getReminderStatus } from "@/lib";
import type { ReminderStatus, Specimen } from "@/types";

interface BotanicalSpecimenCardProps {
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

function getReminderBadgeVariant(
  status: Exclude<ReminderStatus, "none">,
): "upcoming" | "due" | "overdue" {
  return status;
}

export function BotanicalSpecimenCard({
  specimen,
}: BotanicalSpecimenCardProps) {
  const location = formatLocation(specimen);
  const reminderStatus = getReminderStatus(specimen.reminder);

  return (
    <article
      aria-labelledby={`specimen-${specimen.id}-name`}
      className="h-full"
    >
      <Surface className="flex h-full flex-col overflow-hidden">
        <div className="archive-surface specimen-border relative flex min-h-72 items-center justify-center border-x-0 border-t-0 p-8 sm:min-h-80">
          <div className="flex max-w-xs flex-col items-center text-center">
            <p className="metadata-label">Botanical plate</p>

            <div
              aria-hidden="true"
              className="mt-6 h-32 w-px bg-[var(--color-border-strong)] sm:h-40"
            />

            <p className="mt-6 max-w-48 text-xs leading-5 text-[var(--color-text-muted)]">
              Illustration reserved for this specimen
            </p>
          </div>

          {specimen.isFavorite ? (
            <div className="absolute right-5 top-5 flex items-center gap-1.5 text-[var(--color-botanical)]">
              <Star
                aria-hidden="true"
                size={15}
                strokeWidth={1.75}
              />

              <span className="visually-hidden">
                Favorite specimen
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div>
            <p className="metadata-label">
              Collection specimen
            </p>

            <h2
              id={`specimen-${specimen.id}-name`}
              className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
            >
              {specimen.commonName}
            </h2>

            <p className="scientific-name mt-1.5 text-lg leading-7 text-[var(--color-text-secondary)]">
              {specimen.scientificName}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="botanical">
              {formatHealthStatus(specimen.healthStatus)}
            </Badge>

            {specimen.classification.family ? (
              <Badge variant="neutral">
                {specimen.classification.family}
              </Badge>
            ) : null}

            {reminderStatus !== "none" ? (
              <Badge
                variant={getReminderBadgeVariant(reminderStatus)}
              >
                {REMINDER_STATUS_LABELS[reminderStatus]}
              </Badge>
            ) : null}
          </div>

          <dl className="mt-6 grid gap-5 border-t border-[var(--color-border)] pt-5 sm:grid-cols-2">
            <div>
              <dt className="metadata-label">Genus</dt>

              <dd className="scientific-name mt-1.5 text-sm text-[var(--color-text-secondary)]">
                {specimen.classification.genus}
              </dd>
            </div>

            {location ? (
              <div>
                <dt className="metadata-label">Location</dt>

                <dd className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {location}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </Surface>
    </article>
  );
}