import type { CollectionStoreResult } from "../contracts";
import { getOrCreateCloudCollection } from "./collectionLifecycle";
import { createSupabaseCollectionStore } from "./supabaseCollectionStore";

export type CloudCollectionStoreResult =
  | {
      success: true;
      store: ReturnType<typeof createSupabaseCollectionStore>;
    }
  | {
      success: false;
      store: null;
      error: {
        code: string;
        message: string;
      };
    };

export async function getCloudCollectionStore(): Promise<CloudCollectionStoreResult> {
  const collectionResult =
    await getOrCreateCloudCollection();

  if (!collectionResult.success) {
    return {
      success: false,
      store: null,
      error: collectionResult.error,
    };
  }

  return {
    success: true,
    store: createSupabaseCollectionStore(
      collectionResult.data.id,
    ),
  };
}

export async function loadCloudCollection(): Promise<CollectionStoreResult> {
  const storeResult = await getCloudCollectionStore();

  if (!storeResult.success) {
    return {
      success: false,
      data: null,
      error: storeResult.error,
    };
  }

  return storeResult.store.loadCollection();
}