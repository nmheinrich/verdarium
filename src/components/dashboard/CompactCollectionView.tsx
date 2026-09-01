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

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {specimens.map((specimen) => (
          <li key={specimen.id} className="min-w-0">
            <CompactSpecimenCard
              specimen={specimen}
              onSelect={onSpecimenSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}