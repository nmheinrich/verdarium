import type {
  BotanicalClassification,
  Specimen,
  SpecimenHealthStatus,
  SpecimenLightPreference,
  SpecimenLocation,
} from "@/types";

import { validateSpecimenReminder } from "./reminder";

export interface SpecimenValidationIssue {
  field: string;
  message: string;
}

export type SpecimenValidationResult =
  | {
      success: true;
      data: Specimen;
      issues: [];
    }
  | {
      success: false;
      data: null;
      issues: SpecimenValidationIssue[];
    };

const healthStatuses = [
  "thriving",
  "stable",
  "watch",
  "recovering",
  "unknown",
] as const satisfies readonly SpecimenHealthStatus[];

const lightPreferences = [
  "low",
  "medium",
  "bright-indirect",
  "direct",
  "unknown",
] as const satisfies readonly SpecimenLightPreference[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const isoTimestampPattern =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

  if (!isoTimestampPattern.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(value));
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDatePattern.test(value)) {
    return false;
  }

  const parsed = Date.parse(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed)) {
    return false;
  }

  return new Date(parsed).toISOString().startsWith(value);
}

function isHealthStatus(value: unknown): value is SpecimenHealthStatus {
  return (
    typeof value === "string" &&
    healthStatuses.some((status) => status === value)
  );
}

function isLightPreference(value: unknown): value is SpecimenLightPreference {
  return (
    typeof value === "string" &&
    lightPreferences.some((preference) => preference === value)
  );
}

function validateClassification(
  value: unknown,
  issues: SpecimenValidationIssue[],
): BotanicalClassification | null {
  if (!isRecord(value)) {
    issues.push({
      field: "classification",
      message: "Botanical classification must be an object.",
    });

    return null;
  }

  const { family, genus, species, cultivar } = value;

  if (!isNonEmptyString(genus)) {
    issues.push({
      field: "classification.genus",
      message: "Genus is required.",
    });
  }

  if (!isNonEmptyString(species)) {
    issues.push({
      field: "classification.species",
      message: "Species is required.",
    });
  }

  if (!isNonEmptyString(genus) || !isNonEmptyString(species)) {
    return null;
  }

  const classification: BotanicalClassification = {
    genus: genus.trim(),
    species: species.trim(),
  };

  const normalizedFamily = normalizeOptionalString(family);
  const normalizedCultivar = normalizeOptionalString(cultivar);

  if (normalizedFamily) {
    classification.family = normalizedFamily;
  }

  if (normalizedCultivar) {
    classification.cultivar = normalizedCultivar;
  }

  return classification;
}

function validateLocation(
  value: unknown,
  issues: SpecimenValidationIssue[],
): SpecimenLocation | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    issues.push({
      field: "location",
      message: "Specimen location must be an object.",
    });

    return undefined;
  }

  const room = normalizeOptionalString(value.room);
  const position = normalizeOptionalString(value.position);

  if (!room && !position) {
    return undefined;
  }

  const location: SpecimenLocation = {};

  if (room) {
    location.room = room;
  }

  if (position) {
    location.position = position;
  }

  return location;
}

function normalizeTags(
  value: unknown,
  issues: SpecimenValidationIssue[],
): string[] | null {
  if (!Array.isArray(value)) {
    issues.push({
      field: "tags",
      message: "Tags must be an array.",
    });

    return null;
  }

  const normalizedTags: string[] = [];

  for (const tag of value) {
    if (typeof tag !== "string") {
      issues.push({
        field: "tags",
        message: "Every tag must be a string.",
      });

      continue;
    }

    const normalizedTag = tag.trim();

    if (normalizedTag.length === 0) {
      continue;
    }

    const alreadyExists = normalizedTags.some(
      (existingTag) =>
        existingTag.toLocaleLowerCase() === normalizedTag.toLocaleLowerCase(),
    );

    if (!alreadyExists) {
      normalizedTags.push(normalizedTag);
    }
  }

  return normalizedTags;
}

export function validateSpecimen(value: unknown): SpecimenValidationResult {
  const issues: SpecimenValidationIssue[] = [];

  if (!isRecord(value)) {
    return {
      success: false,
      data: null,
      issues: [
        {
          field: "specimen",
          message: "Specimen must be an object.",
        },
      ],
    };
  }

  const {
    id,
    commonName,
    scientificName,
    classification,
    location,
    healthStatus,
    lightPreference,
    acquisitionDate,
    acquisitionSource,
    notes,
    tags,
    illustrationKey,
    reminder,
    isFavorite,
    createdAt,
    updatedAt,
  } = value;

  if (!isNonEmptyString(id)) {
    issues.push({
      field: "id",
      message: "Specimen id is required.",
    });
  }

  if (!isNonEmptyString(commonName)) {
    issues.push({
      field: "commonName",
      message: "Common name is required.",
    });
  }

  if (!isNonEmptyString(scientificName)) {
    issues.push({
      field: "scientificName",
      message: "Scientific name is required.",
    });
  }

  const validatedClassification = validateClassification(
    classification,
    issues,
  );

  const validatedLocation = validateLocation(location, issues);

  if (!isHealthStatus(healthStatus)) {
    issues.push({
      field: "healthStatus",
      message: "Health status is not supported.",
    });
  }

  if (
    lightPreference !== undefined &&
    !isLightPreference(lightPreference)
  ) {
    issues.push({
      field: "lightPreference",
      message: "Light preference is not supported.",
    });
  }

  if (acquisitionDate !== undefined && !isIsoDate(acquisitionDate)) {
    issues.push({
      field: "acquisitionDate",
      message: "Acquisition date must use YYYY-MM-DD format.",
    });
  }

  const normalizedTags = normalizeTags(tags, issues);

  let validatedReminder: Specimen["reminder"];

  if (reminder !== undefined) {
    const reminderResult = validateSpecimenReminder(reminder);

    if (!reminderResult.success) {
      for (const issue of reminderResult.issues) {
        issues.push({
          field: `reminder.${issue.field}`,
          message: issue.message,
        });
      }
    } else {
      validatedReminder = reminderResult.data;
    }
  }

  if (typeof isFavorite !== "boolean") {
    issues.push({
      field: "isFavorite",
      message: "Favorite state must be true or false.",
    });
  }

  if (!isIsoTimestamp(createdAt)) {
    issues.push({
      field: "createdAt",
      message: "Created date must be a valid ISO timestamp.",
    });
  }

  if (!isIsoTimestamp(updatedAt)) {
    issues.push({
      field: "updatedAt",
      message: "Updated date must be a valid ISO timestamp.",
    });
  }

  if (
    issues.length > 0 ||
    !isNonEmptyString(id) ||
    !isNonEmptyString(commonName) ||
    !isNonEmptyString(scientificName) ||
    validatedClassification === null ||
    !isHealthStatus(healthStatus) ||
    normalizedTags === null ||
    typeof isFavorite !== "boolean" ||
    !isIsoTimestamp(createdAt) ||
    !isIsoTimestamp(updatedAt)
  ) {
    return {
      success: false,
      data: null,
      issues,
    };
  }

  const specimen: Specimen = {
    id: id.trim(),
    commonName: commonName.trim(),
    scientificName: scientificName.trim(),
    classification: validatedClassification,
    healthStatus,
    tags: normalizedTags,
    isFavorite,
    createdAt,
    updatedAt,
  };

  if (validatedLocation) {
    specimen.location = validatedLocation;
  }

  if (isLightPreference(lightPreference)) {
    specimen.lightPreference = lightPreference;
  }

  if (typeof acquisitionDate === "string") {
    specimen.acquisitionDate = acquisitionDate;
  }

  const normalizedAcquisitionSource =
    normalizeOptionalString(acquisitionSource);

  if (normalizedAcquisitionSource) {
    specimen.acquisitionSource = normalizedAcquisitionSource;
  }

  const normalizedNotes = normalizeOptionalString(notes);

  if (normalizedNotes) {
    specimen.notes = normalizedNotes;
  }

  const normalizedIllustrationKey =
    normalizeOptionalString(illustrationKey);

  if (normalizedIllustrationKey) {
    specimen.illustrationKey = normalizedIllustrationKey;
  }

  if (validatedReminder) {
    specimen.reminder = validatedReminder;
  }

  return {
    success: true,
    data: specimen,
    issues: [],
  };
}