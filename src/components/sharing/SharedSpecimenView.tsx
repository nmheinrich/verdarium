import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { Star } from "lucide-react";

import { BotanicalIllustration } from "@/components/illustrations/BotanicalIllustration";
import {
  Badge,
  Surface,
} from "@/components/ui";

import type { SharedSpecimen } from "@/sharing/types";

interface SharedSpecimenViewProps {
  specimen: SharedSpecimen;
}

function formatHealthStatus(
  healthStatus: SharedSpecimen["healthStatus"],
): string {
  return (
    healthStatus.charAt(0).toUpperCase() +
    healthStatus.slice(1)
  );
}

function formatLightPreference(
  lightPreference: NonNullable<
    SharedSpecimen["lightPreference"]
  >,
): string {
  return lightPreference
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export function SharedSpecimenView({
  specimen,
}: SharedSpecimenViewProps) {
  const shouldReduceMotion = useReducedMotion();

  const headingId =
    `shared-expanded-specimen-${specimen.id}-name`;

  return (
    <motion.article
      aria-labelledby={headingId}
      initial={
        shouldReduceMotion
          ? false
          : {
              opacity: 0,
              y: 14,
              scale: 0.985,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={
        shouldReduceMotion
          ? {
              opacity: 0,
            }
          : {
              opacity: 0,
              y: 10,
              scale: 0.985,
            }
      }
      transition={{
        duration: shouldReduceMotion
          ? 0.1
          : 0.3,
        ease: shouldReduceMotion
          ? "easeOut"
          : [0.22, 1, 0.36, 1],
      }}
      className="min-w-0"
    >
      <Surface className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
          <div className="relative flex min-h-80 items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-surface)] p-8 lg:min-h-[34rem] lg:border-b-0 lg:border-r">
            <BotanicalIllustration
              illustrationKey={
                specimen.illustrationKey
              }
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
            <div className="min-w-0">
              <p className="metadata-label">
                Shared specimen record
              </p>

              <h2
                id={headingId}
                tabIndex={-1}
                className="mt-3 break-words font-serif text-3xl leading-tight text-[var(--color-text-primary)] sm:text-4xl"
              >
                {specimen.commonName}
              </h2>

              <p className="scientific-name mt-2 break-words text-xl leading-8 text-[var(--color-text-secondary)]">
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

            <dl className="mt-8 grid gap-x-8 gap-y-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
              <div>
                <dt className="metadata-label">
                  Genus
                </dt>

                <dd className="scientific-name mt-1.5 break-words text-sm text-[var(--color-text-secondary)]">
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

                <dd className="scientific-name mt-1.5 break-words text-sm text-[var(--color-text-secondary)]">
                  {
                    specimen.classification
                      .species
                  }
                </dd>
              </div>

              {specimen.classification.cultivar ? (
                <div>
                  <dt className="metadata-label">
                    Cultivar
                  </dt>

                  <dd className="mt-1.5 break-words text-sm text-[var(--color-text-secondary)]">
                    {
                      specimen.classification
                        .cultivar
                    }
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
            </dl>

            {specimen.tags.length > 0 ? (
              <section
                aria-labelledby={`shared-expanded-specimen-${specimen.id}-tags`}
                className="mt-8 border-t border-[var(--color-border)] pt-6"
              >
                <h3
                  id={`shared-expanded-specimen-${specimen.id}-tags`}
                  className="metadata-label"
                >
                  Botanical tags
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

            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              <p className="text-xs leading-5 text-[var(--color-text-muted)]">
                This shared botanical record
                excludes private archive notes,
                locations, acquisition details,
                and care information.
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </motion.article>
  );
}