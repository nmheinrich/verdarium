import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { Specimen } from "@/types";

import { CompactSpecimenCard } from "@/components/cards";

interface CompactCollectionViewProps {
  specimens: Specimen[];
  onSpecimenSelect?: (specimen: Specimen) => void;
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
    <section aria-labelledby="compact-collection-heading">
      <div className="mb-6">
        <p className="metadata-label">Collection index</p>

        <h2
          id="compact-collection-heading"
          className="mt-2 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
        >
          Specimen collection
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
          A compact view for scanning the botanical records in your archive.
        </p>
      </div>

      <motion.ul
        layout={!shouldReduceMotion}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
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
              className="min-w-0"
            >
              <CompactSpecimenCard
                specimen={specimen}
                onSelect={onSpecimenSelect}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}