import { format } from "date-fns";

import { useTileCareController } from "@/care/useTileCare";
import { SpecimenTile } from "@/components/cards";
import { getBotanicalIllustration } from "@/constants/illustrations";
import { getCareStateLabel } from "@/lib";
import type { Specimen } from "@/types";

import { CareOptionsMenu } from "./CareOptionsMenu";

interface SpecimenCareTileProps {
  specimen: Specimen;
  onOpen?: () => void;
  openButtonId?: string;
  density?: "default" | "compact";
  className?: string;
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

function formatRecordedDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  return format(new Date(year, month - 1, day), "MMM d");
}

/**
 * A specimen tile with care recorded in place (spec 001): Record care,
 * the Recorded · Undo · Add note window, and snooze or skip from the
 * care options popover. Without a care controller it is a plain tile.
 */
export function SpecimenCareTile({
  specimen,
  onOpen,
  openButtonId,
  density,
  className,
}: SpecimenCareTileProps) {
  const care = useTileCareController();
  const careState = getCareStateLabel(specimen.reminder);
  const pending = care?.pending[specimen.id];
  const reminder = specimen.reminder;

  return (
    <SpecimenTile
      className={className}
      density={density}
      commonName={specimen.commonName}
      scientificName={formatBinomial(specimen)}
      cultivar={specimen.classification.cultivar}
      illustration={
        getBotanicalIllustration(specimen.illustrationKey)?.src
      }
      label={formatLocation(specimen)}
      health={formatHealthStatus(specimen.healthStatus)}
      favorite={specimen.isFavorite}
      careState={careState}
      openButtonId={openButtonId}
      onOpen={onOpen}
      careBusy={care?.busy[specimen.id]}
      careMessage={care?.messages[specimen.id]}
      recorded={
        care && pending
          ? {
              label: `Recorded · ${formatRecordedDate(pending.completedAt)}`,
              note: pending.note,
              onUndo: () => care.undo(specimen.id),
              onSaveNote: (note) => care.setNote(specimen.id, note),
              onNoteOpenChange: (open) =>
                care.setNoteOpen(specimen.id, open),
            }
          : undefined
      }
      onRecordCare={
        care && careState ? () => care.recordCare(specimen) : undefined
      }
      renderCareOptions={
        care && careState && reminder
          ? (close) => (
              <CareOptionsMenu
                reminder={reminder}
                busy={care.busy[specimen.id]}
                onSnooze={(snoozedUntil) =>
                  care.snooze(specimen, snoozedUntil)
                }
                onSkip={() => care.skip(specimen)}
                onClose={close}
              />
            )
          : undefined
      }
    />
  );
}
