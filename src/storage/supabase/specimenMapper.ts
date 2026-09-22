import type { Specimen } from "@/types";
import { validateSpecimen } from "@/validation";

import type { SupabaseSpecimenRow } from "./types";

function nullToUndefined<T>(
  value: T | null,
): T | undefined {
  return value === null
    ? undefined
    : value;
}

function undefinedToNull<T>(
  value: T | undefined,
): T | null {
  return value === undefined
    ? null
    : value;
}

function normalizeDatabaseTimestamp(
  value: string,
): string {
  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return parsedDate.toISOString();
}

export function toSupabaseSpecimenRow(
  specimen: Specimen,
  collectionId: string,
): SupabaseSpecimenRow {
  return {
    id: specimen.id,
    collection_id: collectionId,

    common_name:
      specimen.commonName,
    scientific_name:
      specimen.scientificName,

    classification:
      specimen.classification,
    location:
      undefinedToNull(
        specimen.location,
      ),

    health_status:
      specimen.healthStatus,
    light_preference:
      undefinedToNull(
        specimen.lightPreference,
      ),

    acquisition_date:
      undefinedToNull(
        specimen.acquisitionDate,
      ),
    acquisition_source:
      undefinedToNull(
        specimen.acquisitionSource,
      ),

    notes:
      undefinedToNull(
        specimen.notes,
      ),
    tags: specimen.tags,

    illustration_key:
      undefinedToNull(
        specimen.illustrationKey,
      ),
    reminder:
      undefinedToNull(
        specimen.reminder,
      ),

    is_favorite:
      specimen.isFavorite,

    created_at:
      specimen.createdAt,
    updated_at:
      specimen.updatedAt,
  };
}

export function fromSupabaseSpecimenRow(
  row: SupabaseSpecimenRow,
): Specimen {
  const candidate = {
    id: row.id,
    commonName:
      row.common_name,
    scientificName:
      row.scientific_name,

    classification:
      row.classification,
    location:
      nullToUndefined(
        row.location,
      ),

    healthStatus:
      row.health_status,
    lightPreference:
      nullToUndefined(
        row.light_preference,
      ),

    acquisitionDate:
      nullToUndefined(
        row.acquisition_date,
      ),
    acquisitionSource:
      nullToUndefined(
        row.acquisition_source,
      ),

    notes:
      nullToUndefined(
        row.notes,
      ),
    tags: row.tags,

    illustrationKey:
      nullToUndefined(
        row.illustration_key,
      ),
    reminder:
      nullToUndefined(
        row.reminder,
      ),

    isFavorite:
      row.is_favorite,

    createdAt:
      normalizeDatabaseTimestamp(
        row.created_at,
      ),
    updatedAt:
      normalizeDatabaseTimestamp(
        row.updated_at,
      ),
  };

  const result =
    validateSpecimen(candidate);

  if (!result.success) {
    const issueSummary =
      result.issues
        .map(
          (issue) =>
            `${issue.field}: ${issue.message}`,
        )
        .join("; ");

    throw new Error(
      `Supabase specimen "${row.id}" failed Verdarium validation: ${issueSummary}`,
    );
  }

  return result.data;
}