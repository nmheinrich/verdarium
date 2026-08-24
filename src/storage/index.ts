export {
  addSpecimen,
  deleteSpecimen,
  loadCollection,
  saveCollection,
  updateSpecimen,
} from "./collection";

export type {
  CollectionMutationResult,
  CollectionStorageError,
  CollectionStorageErrorCode,
  LoadCollectionResult,
} from "./collection";

export {
  readStorageItem,
  removeStorageItem,
  writeStorageItem,
} from "./localStorage";

export type {
  StorageAccessError,
  StorageReadResult,
  StorageWriteResult,
} from "./localStorage";

export {
  createEmptyCollectionStorage,
} from "./schema";

export type {
  CollectionStorageSchema,
} from "./schema";