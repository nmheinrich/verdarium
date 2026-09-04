import {
  STORAGE_SCHEMA_VERSION,
} from "@/constants";
import type { Specimen } from "@/types";

import {
  parseCollectionData,
  type CollectionStorageError,
} from "./collection";
import type { CollectionStorageSchema } from "./schema";

export type ExportCollectionResult =
  | {
      success: true;
      data: string;
    }
  | {
      success: false;
      data: null;
      error: CollectionStorageError;
    };

export function createCollectionExport(
  specimens: Specimen[],
): ExportCollectionResult {
  const schema: CollectionStorageSchema = {
    version: STORAGE_SCHEMA_VERSION,
    specimens,
  };

  let serializedCollection: string;

  try {
    serializedCollection = JSON.stringify(
      schema,
      null,
      2,
    );
  } catch {
    return {
      success: false,
      data: null,
      error: {
        code: "write-failed",
        message:
          "Verdarium could not serialize the collection for export.",
      },
    };
  }

  const validationResult =
    parseCollectionData(serializedCollection);

  if (!validationResult.success) {
    return {
      success: false,
      data: null,
      error: validationResult.error,
    };
  }

  return {
    success: true,
    data: serializedCollection,
  };
}