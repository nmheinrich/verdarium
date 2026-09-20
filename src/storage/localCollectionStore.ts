import type { Specimen } from "@/types";

import {
  addSpecimen as addLocalSpecimen,
  deleteSpecimen as deleteLocalSpecimen,
  loadCollection,
  saveCollection,
  updateSpecimen as updateLocalSpecimen,
} from "./collection";
import type {
  CollectionStore,
  CollectionStoreResult,
} from "./contracts";

export const localCollectionStore: CollectionStore = {
  async loadCollection(): Promise<CollectionStoreResult> {
    return loadCollection();
  },

  async replaceCollection(
    specimens: Specimen[],
  ): Promise<CollectionStoreResult> {
    const result = saveCollection(specimens);

    if (!result.success) {
      return result;
    }

    return {
      success: true,
      data: specimens,
    };
  },

  async addSpecimen(
    specimen: Specimen,
  ): Promise<CollectionStoreResult> {
    return addLocalSpecimen(specimen);
  },

  async updateSpecimen(
    specimen: Specimen,
  ): Promise<CollectionStoreResult> {
    return updateLocalSpecimen(specimen);
  },

  async deleteSpecimen(
    specimenId: string,
  ): Promise<CollectionStoreResult> {
    return deleteLocalSpecimen(specimenId);
  },
};