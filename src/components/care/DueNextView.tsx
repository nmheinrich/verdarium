import { Leaf } from "lucide-react";

import {
  createCareOverview,
  type CareSpecimen,
} from "@/care/careSelectors";
import { useLocalDateRollover } from "@/care/useLocalDateRollover";
import { Button, Surface } from "@/components/ui";
import type { Specimen } from "@/types";

import { SpecimenCareTile } from "./SpecimenCareTile";

interface DueNextViewProps {
  specimens: Specimen[];
  onOpenSpecimen: (specimen: Specimen) => void;
  onBrowseCollection: () => void;
}

// "This week" covers the next seven days; everything after is "Later".
const THIS_WEEK_DAYS = 7;

const GROUPS = [
  { key: "overdue", title: "Overdue" },
  { key: "today", title: "Today" },
  { key: "upcoming", title: "This week" },
  { key: "later", title: "Later" },
] as const;

/**
 * The care schedule, read like a stewardship register (spec 001).
 * Tiles carry the same record, note, snooze and skip actions as the
 * collection.
 */
export function DueNextView({
  specimens,
  onOpenSpecimen,
  onBrowseCollection,
}: DueNextViewProps) {
  const rolloverToken = useLocalDateRollover();
  void rolloverToken;

  const overview = createCareOverview(
    specimens,
    new Date(),
    THIS_WEEK_DAYS,
  );

  const hasScheduledCare = GROUPS.some(
    (group) => overview[group.key].length > 0,
  );

  if (!hasScheduledCare) {
    return (
      <Surface variant="subtle" className="mt-8 p-8 sm:p-10">
        <section aria-labelledby="due-next-empty-heading" className="max-w-2xl">
          <Leaf
            aria-hidden="true"
            size={18}
            strokeWidth={1.75}
            className="text-[var(--color-text-muted)]"
          />
          <h2
            id="due-next-empty-heading"
            className="mt-4 font-display type-title text-[var(--color-text-primary)]"
          >
            No care is scheduled.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Reminders can be set on any specimen record.
          </p>
          <div className="mt-6">
            <Button variant="secondary" onClick={onBrowseCollection}>
              Browse collection
            </Button>
          </div>
        </section>
      </Surface>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {GROUPS.map((group) => (
        <DueNextGroup
          key={group.key}
          id={`due-next-${group.key}`}
          title={group.title}
          careSpecimens={overview[group.key]}
          onOpenSpecimen={onOpenSpecimen}
        />
      ))}
    </div>
  );
}

interface DueNextGroupProps {
  id: string;
  title: string;
  careSpecimens: CareSpecimen[];
  onOpenSpecimen: (specimen: Specimen) => void;
}

function DueNextGroup({
  id,
  title,
  careSpecimens,
  onOpenSpecimen,
}: DueNextGroupProps) {
  if (careSpecimens.length === 0) {
    return null;
  }

  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="metadata-label mb-4 border-b border-[var(--color-border)] pb-3 text-[var(--color-text-secondary)]"
      >
        {title}
      </h2>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-5">
        {careSpecimens.map(({ specimen }) => (
          <li key={specimen.id} className="flex min-w-0">
            <SpecimenCareTile
              className="w-full"
              density="compact"
              specimen={specimen}
              openButtonId={`due-next-specimen-${specimen.id}-open`}
              onOpen={() => onOpenSpecimen(specimen)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
