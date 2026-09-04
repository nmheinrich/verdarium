import {
  COLLECTION_STORAGE_KEY,
  STORAGE_SCHEMA_VERSION,
} from "@/constants";

import type { Specimen } from "@/types";
import { validateSpecimen } from "@/validation";

import {
  readStorageItem,
  writeStorageItem,
} from "./localStorage";

import {
  createEmptyCollectionStorage,
  type CollectionStorageSchema,
} from "./schema";

export type CollectionStorageErrorCode =
  | "storage-unavailable"
  | "invalid-json"
  | "invalid-schema"
  | "unsupported-version"
  | "invalid-specimen"
  | "duplicate-id"
  | "specimen-not-found"
  | "write-failed";

export interface CollectionStorageError {
  code: CollectionStorageErrorCode;
  message: string;
}

export type LoadCollectionResult =
  | {
      success: true;
      data: Specimen[];
    }
  | {
      success: false;
      data: null;
      error: CollectionStorageError;
    };

export type CollectionMutationResult =
  | {
      success: true;
      data: Specimen[];
    }
  | {
      success: false;
      data: null;
      error: CollectionStorageError;
    };

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function parseCollectionData(
  value: string,
): LoadCollectionResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    return {
      success: false,
      data: null,
      error: {
        code: "invalid-json",
        message:
          "Stored collection data is not valid JSON.",
      },
    };
  }

  if (!isRecord(parsed)) {
    return {
      success: false,
      data: null,
      error: {
        code: "invalid-schema",
        message:
          "Stored collection data has an invalid structure.",
      },
    };
  }

  const {
    version,
    specimens,
  } = parsed;

  if (typeof version !== "number") {
    return {
      success: false,
      data: null,
      error: {
        code: "invalid-schema",
        message:
          "Stored collection data is missing a valid schema version.",
      },
    };
  }

  if (version !== STORAGE_SCHEMA_VERSION) {
    return {
      success: false,
      data: null,
      error: {
        code: "unsupported-version",
        message: `Stored collection schema version ${version} is not supported.`,
      },
    };
  }

  if (!Array.isArray(specimens)) {
    return {
      success: false,
      data: null,
      error: {
        code: "invalid-schema",
        message:
          "Stored collection specimens must be an array.",
      },
    };
  }

  const validatedSpecimens: Specimen[] = [];
  const ids = new Set<string>();

  for (const specimenValue of specimens) {
    const result =
      validateSpecimen(specimenValue);

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "invalid-specimen",
          message:
            "Stored collection contains an invalid specimen.",
        },
      };
    }

    if (ids.has(result.data.id)) {
      return {
        success: false,
        data: null,
        error: {
          code: "duplicate-id",
          message: `Stored collection contains duplicate specimen id "${result.data.id}".`,
        },
      };
    }

    ids.add(result.data.id);
    validatedSpecimens.push(result.data);
  }

  return {
    success: true,
    data: validatedSpecimens,
  };
}

function persistCollection(
  specimens: Specimen[],
): CollectionMutationResult {
  const validatedSpecimens: Specimen[] = [];
  const ids = new Set<string>();

  for (const specimen of specimens) {
    const result = validateSpecimen(specimen);

    if (!result.success) {
      return {
        success: false,
        data: null,
        error: {
          code: "invalid-specimen",
          message: `Specimen "${specimen.id}" is invalid and cannot be saved.`,
        },
      };
    }

    if (ids.has(result.data.id)) {
      return {
        success: false,
        data: null,
        error: {
          code: "duplicate-id",
          message: `Specimen id "${result.data.id}" already exists.`,
        },
      };
    }

    ids.add(result.data.id);
    validatedSpecimens.push(result.data);
  }

  const schema: CollectionStorageSchema = {
    version: STORAGE_SCHEMA_VERSION,
    specimens: validatedSpecimens,
  };

  let serialized: string;

  try {
    serialized = JSON.stringify(schema);
  } catch {
    return {
      success: false,
      data: null,
      error: {
        code: "write-failed",
        message:
          "Unable to serialize collection data.",
      },
    };
  }

  const writeResult = writeStorageItem(
    COLLECTION_STORAGE_KEY,
    serialized,
  );

  if (!writeResult.success) {
    return {
      success: false,
      data: null,
      error: {
        code:
          writeResult.error.code ===
          "unavailable"
            ? "storage-unavailable"
            : "write-failed",
        message: writeResult.error.message,
      },
    };
  }

  return {
    success: true,
    data: validatedSpecimens,
  };
}

export function loadCollection():
  LoadCollectionResult {
  const readResult = readStorageItem(
    COLLECTION_STORAGE_KEY,
  );

  if (!readResult.success) {
    return {
      success: false,
      data: null,
      error: {
        code: "storage-unavailable",
        message: readResult.error.message,
      },
    };
  }

  if (readResult.value === null) {
    const emptyCollection =
      createEmptyCollectionStorage();

    return {
      success: true,
      data: emptyCollection.specimens,
    };
  }

  return parseCollectionData(
    readResult.value,
  );
}

export function saveCollection(
  specimens: Specimen[],
): CollectionMutationResult {
  return persistCollection(specimens);
}

export function addSpecimen(
  specimen: Specimen,
): CollectionMutationResult {
  const currentCollection =
    loadCollection();

  if (!currentCollection.success) {
    return currentCollection;
  }

  if (
    currentCollection.data.some(
      (existingSpecimen) =>
        existingSpecimen.id === specimen.id,
    )
  ) {
    return {
      success: false,
      data: null,
      error: {
        code: "duplicate-id",
        message: `Specimen id "${specimen.id}" already exists.`,
      },
    };
  }

  return persistCollection([
    ...currentCollection.data,
    specimen,
  ]);
}

export function updateSpecimen(
  specimen: Specimen,
): CollectionMutationResult {
  const currentCollection =
    loadCollection();

  if (!currentCollection.success) {
    return currentCollection;
  }

  const specimenIndex =
    currentCollection.data.findIndex(
      (existingSpecimen) =>
        existingSpecimen.id === specimen.id,
    );

  if (specimenIndex === -1) {
    return {
      success: false,
      data: null,
      error: {
        code: "specimen-not-found",
        message: `Specimen id "${specimen.id}" was not found.`,
      },
    };
  }

  const updatedCollection = [
    ...currentCollection.data,
  ];

  updatedCollection[specimenIndex] =
    specimen;

  return persistCollection(
    updatedCollection,
  );
}

export function deleteSpecimen(
  specimenId: string,
): CollectionMutationResult {
  const currentCollection =
    loadCollection();

  if (!currentCollection.success) {
    return currentCollection;
  }

  const specimenExists =
    currentCollection.data.some(
      (specimen) =>
        specimen.id === specimenId,
    );

  if (!specimenExists) {
    return {
      success: false,
      data: null,
      error: {
        code: "specimen-not-found",
        message: `Specimen id "${specimenId}" was not found.`,
      },
    };
  }

  const updatedCollection =
    currentCollection.data.filter(
      (specimen) =>
        specimen.id !== specimenId,
    );

  return persistCollection(
    updatedCollection,
  );
}