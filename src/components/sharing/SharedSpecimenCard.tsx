import { Star } from "lucide-react";

import { BotanicalIllustration } from "@/components/illustrations/BotanicalIllustration";
import {
  Badge,
  Surface,
} from "@/components/ui";

import type { SharedSpecimen } from "@/sharing/types";

interface SharedSpecimenCardProps {
  specimen: SharedSpecimen;
  onOpen: (specimen: SharedSpecimen) => void;
}

function formatHealthStatus(
  healthStatus: SharedSpecimen["healthStatus"],
): string {
  return (
    healthStatus.charAt(0).toUpperCase() +
    healthStatus.slice(1)
  );
}

export function SharedSpecimenCard({
  specimen,
  onOpen,
}: SharedSpecimenCardProps) {
  return (
    <article
      aria-labelledby={`shared-specimen-${specimen.id}-name`}
      className="h-full"
    >
      <button
        type="button"
        id={`shared-specimen-${specimen.id}-open`}
        className="group block h-full w-full rounded-[var(--radius-lg)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
        onClick={() => {
          onOpen(specimen);
        }}
      >
        <Surface className="flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-[var(--transition-base)] ease-[var(--ease-standard)] group-hover:border-[var(--color-border-strong)]">
          <div className="relative">
            <BotanicalIllustration
              illustrationKey={specimen.illustrationKey}
              presentation="card"
              className="min-h-72 border-x-0 border-t-0 sm:min-h-80"
            />

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
                Shared specimen
              </p>

              <h2
                id={`shared-specimen-${specimen.id}-name`}
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
                {formatHealthStatus(
                  specimen.healthStatus,
                )}
              </Badge>

              {specimen.classification.family ? (
                <Badge variant="neutral">
                  {specimen.classification.family}
                </Badge>
              ) : null}
            </div>

            <dl className="mt-6 grid gap-5 border-t border-[var(--color-border)] pt-5 sm:grid-cols-2">
              <div>
                <dt className="metadata-label">
                  Genus
                </dt>

                <dd className="scientific-name mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  {
                    specimen.classification
                      .genus
                  }
                </dd>
              </div>

              <div>
                <dt className="metadata-label">
                  Species
                </dt>

                <dd className="scientific-name mt-1.5 text-sm text-[var(--color-text-secondary)]">
                  {
                    specimen.classification
                      .species
                  }
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-xs leading-5 text-[var(--color-text-muted)]">
              Open botanical record
            </p>
          </div>
        </Surface>
      </button>
    </article>
  );
}