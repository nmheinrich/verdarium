import type { Specimen } from "@/types";

import { STORAGE_SCHEMA_VERSION } from "@/constants";

export interface CollectionStorageSchema {
  version: typeof STORAGE_SCHEMA_VERSION;
  specimens: Specimen[];
}

export function createEmptyCollectionStorage(): CollectionStorageSchema {
  return {
    version: STORAGE_SCHEMA_VERSION,
    specimens: [],
  };
}