import type { ReactNode } from "react";

import { Star } from "lucide-react";

import { BotanicalIllustration } from "@/components/illustrations/BotanicalIllustration";
import { Badge, Surface } from "@/components/ui";
import { REMINDER_STATUS_LABELS } from "@/constants";
import { formatDisplayDate, getReminderStatus } from "@/lib";

import type { ReminderStatus, Specimen } from "@/types";

interface ExpandedSpecimenViewProps {
  specimen: Specimen;
  actions?: ReactNode;
}

function formatHealthStatus(
  healthStatus: Specimen["healthStatus"],
): string {
  return healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);
}

function formatLightPreference(
  lightPreference: NonNullable<Specimen["lightPreference"]>,
): string {
  return lightPreference
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

export function ExpandedSpecimenView({
  specimen,
  actions,
}: ExpandedSpecimenViewProps) {
  const location = formatLocation(specimen);

  const acquisitionDate = specimen.acquisitionDate
    ? formatDisplayDate(specimen.acquisitionDate)
    : null;

  const reminderStatus = getReminderStatus(specimen.reminder);

  return (
    <article
      aria-labelledby={`expanded-specimen-${specimen.id}-name`}
      className="min-w-0"
    >
      <Surface className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <div className="relative flex min-h-80 items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-surface)] p-8 lg:min-h-[34rem] lg:border-b-0 lg:border-r">
            <BotanicalIllustration
              illustrationKey={specimen.illustrationKey}
              presentation="plate"
              className="w-full max-w-sm"
            />

            {specimen.isFavorite ? (
              <div className="absolute right-6 top-6 text-[var(--color-botanical)]">
                <Star
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.75}
                />

                <span className="visually-hidden">
                  Favorite specimen
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="metadata-label">
                  Specimen record
                </p>

                <h2
                  id={`expanded-specimen-${specimen.id}-name`}
                  className="mt-3 font-serif text-3xl leading-tight text-[var(--color-text-primary)] sm:text-4xl"
                >
                  {specimen.commonName}
                </h2>

                <p className="scientific-name mt-2 text-xl leading-8 text-[var(--color-text-secondary)]">
                  {specimen.scientificName}
                </p>
              </div>

              {actions ? (
                <div className="flex shrink-0 flex-wrap gap-2">
                  {actions}
                </div>
              ) : null}
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

            <dl className="mt-8 grid gap-x-8 gap-y-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
              <div>
                <dt className="metadata-label">
                  Genus
                </dt>

                <dd className="scientific-name mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  {specimen.classification.genus}
                </dd>
              </div>

              <div>
                <dt className="metadata-label">
                  Species
                </dt>

                <dd className="scientific-name mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  {specimen.classification.species}
                </dd>
              </div>

              {specimen.classification.cultivar ? (
                <div>
                  <dt className="metadata-label">
                    Cultivar
                  </dt>

                  <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                    {specimen.classification.cultivar}
                  </dd>
                </div>
              ) : null}

              {location ? (
                <div>
                  <dt className="metadata-label">
                    Location
                  </dt>

                  <dd className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {location}
                  </dd>
                </div>
              ) : null}

              {specimen.lightPreference ? (
                <div>
                  <dt className="metadata-label">
                    Light
                  </dt>

                  <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                    {formatLightPreference(
                      specimen.lightPreference,
                    )}
                  </dd>
                </div>
              ) : null}

              {acquisitionDate ? (
                <div>
                  <dt className="metadata-label">
                    Acquired
                  </dt>

                  <dd className="mt-1.5 text-sm text-[var(--color-text-secondary)]">
                    {acquisitionDate}
                  </dd>
                </div>
              ) : null}

              {specimen.acquisitionSource ? (
                <div>
                  <dt className="metadata-label">
                    Source
                  </dt>

                  <dd className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {specimen.acquisitionSource}
                  </dd>
                </div>
              ) : null}
            </dl>

            {specimen.tags.length > 0 ? (
              <section
                aria-labelledby={`expanded-specimen-${specimen.id}-tags`}
                className="mt-8 border-t border-[var(--color-border)] pt-6"
              >
                <h3
                  id={`expanded-specimen-${specimen.id}-tags`}
                  className="metadata-label"
                >
                  Archive tags
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {specimen.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="neutral"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {specimen.notes ? (
              <section
                aria-labelledby={`expanded-specimen-${specimen.id}-notes`}
                className="mt-8 border-t border-[var(--color-border)] pt-6"
              >
                <h3
                  id={`expanded-specimen-${specimen.id}-notes`}
                  className="metadata-label"
                >
                  Archive notes
                </h3>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-secondary)]">
                  {specimen.notes}
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </Surface>
    </article>
  );
}