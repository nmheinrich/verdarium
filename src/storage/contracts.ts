import type { Specimen } from "@/types";

export interface CollectionStoreError {
  code: string;
  message: string;
}

export type CollectionStoreResult =
  | {
      success: true;
      data: Specimen[];
    }
  | {
      success: false;
      data: null;
      error: CollectionStoreError;
    };

export interface CollectionStore {
  loadCollection(): Promise<CollectionStoreResult>;

  replaceCollection(
    specimens: Specimen[],
  ): Promise<CollectionStoreResult>;

  addSpecimen(
    specimen: Specimen,
  ): Promise<CollectionStoreResult>;

  updateSpecimen(
    specimen: Specimen,
  ): Promise<CollectionStoreResult>;

  deleteSpecimen(
    specimenId: string,
  ): Promise<CollectionStoreResult>;
}