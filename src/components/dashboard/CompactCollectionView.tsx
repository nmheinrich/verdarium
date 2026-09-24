import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SpecimenCareTile } from "@/components/care";
import type { Specimen } from "@/types";

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
              <SpecimenCareTile
                className="w-full"
                specimen={specimen}
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
