import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SpecimenTile } from "@/components/cards";
import { getBotanicalIllustration } from "@/constants/illustrations";
import { getCareStateLabel } from "@/lib";
import type { Specimen } from "@/types";

interface CompactCollectionViewProps {
  specimens: Specimen[];
  onSpecimenSelect?: (specimen: Specimen) => void;
}

function formatHealthStatus(
  healthStatus: Specimen["healthStatus"],
): string {
  return healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1);
}

function formatLocation(specimen: Specimen): string | undefined {
  const locationParts = [
    specimen.location?.room,
    specimen.location?.position,
  ].filter(Boolean);

  return locationParts.length > 0
    ? locationParts.join(" · ")
    : undefined;
}

function formatBinomial(specimen: Specimen): string {
  const { genus, species } = specimen.classification;

  return genus && species
    ? `${genus} ${species}`
    : specimen.scientificName;
}

export function CompactCollectionView({
  specimens,
  onSpecimenSelect,
}: CompactCollectionViewProps) {
  const shouldReduceMotion = useReducedMotion();

  if (specimens.length === 0) {
    return null;
  }

  return (
    <section aria-label="Specimen collection">
      <motion.ul
        layout={!shouldReduceMotion}
        className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-6"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {specimens.map((specimen) => (
            <motion.li
              key={specimen.id}
              layout={!shouldReduceMotion}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 6,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={
                shouldReduceMotion
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 0,
                      y: -4,
                    }
              }
              transition={{
                duration: shouldReduceMotion ? 0.1 : 0.2,
                ease: "easeOut",
              }}
              className="flex min-w-0"
            >
              <SpecimenTile
                className="w-full"
                commonName={specimen.commonName}
                scientificName={formatBinomial(specimen)}
                cultivar={specimen.classification.cultivar}
                illustration={
                  getBotanicalIllustration(specimen.illustrationKey)?.src
                }
                label={formatLocation(specimen)}
                health={formatHealthStatus(specimen.healthStatus)}
                favorite={specimen.isFavorite}
                careState={getCareStateLabel(specimen.reminder)}
                openButtonId={`compact-specimen-${specimen.id}-open`}
                onOpen={
                  onSpecimenSelect
                    ? () => onSpecimenSelect(specimen)
                    : undefined
                }
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}
