import type { Specimen } from "@/types";

import {
  parseCollectionData,
  type CollectionStorageError,
} from "./collection";

export type ImportCollectionParseResult =
  | {
      success: true;
      data: Specimen[];
    }
  | {
      success: false;
      data: null;
      error: CollectionStorageError;
    };

export function parseImportedCollection(
  value: string,
): ImportCollectionParseResult {
  return parseCollectionData(value);
}