import type { Specimen } from "@/types";

import type { CollectionStoreResult } from "../contracts";
import { localCollectionStore } from "../localCollectionStore";
import {
  getCloudCollectionStore,
  loadCloudCollection,
} from "./cloudCollectionStore";
import {
  inspectCollectionSyncState,
  type CollectionSyncState,
} from "./sync";

export type MigrationActionResult =
  | {
      success: true;
      data: Specimen[];
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
      };
    };

function conflictFailure(): MigrationActionResult {
  return {
    success: false,
    data: null,
    error: {
      code: "sync-conflict",
      message:
        "The local and cloud collections both contain different data. Verdarium will not overwrite either collection automatically.",
    },
  };
}

async function migrateLocalToCloud(
  state: Extract<CollectionSyncState, { status: "local-only" }>,
): Promise<MigrationActionResult> {
  const cloudStoreResult = await getCloudCollectionStore();

  if (!cloudStoreResult.success) {
    return {
      success: false,
      data: null,
      error: cloudStoreResult.error,
    };
  }

  return cloudStoreResult.store.replaceCollection(
    state.local,
  );
}

async function migrateCloudToLocal(
  state: Extract<CollectionSyncState, { status: "cloud-only" }>,
): Promise<MigrationActionResult> {
  return localCollectionStore.replaceCollection(
    state.cloud,
  );
}

export async function synchronizeCollectionWhenSafe(): Promise<MigrationActionResult> {
  const syncResult = await inspectCollectionSyncState();

  if (!syncResult.success) {
    return syncResult;
  }

  switch (syncResult.data.status) {
    case "empty":
      return {
        success: true,
        data: [],
      };

    case "matching":
      return {
        success: true,
        data: syncResult.data.cloud,
      };

    case "local-only":
      return migrateLocalToCloud(syncResult.data);

    case "cloud-only":
      return migrateCloudToLocal(syncResult.data);

    case "conflict":
      return conflictFailure();
  }
}

export async function replaceCloudCollectionFromLocal(): Promise<CollectionStoreResult> {
  const localResult =
    await localCollectionStore.loadCollection();

  if (!localResult.success) {
    return localResult;
  }

  const cloudStoreResult = await getCloudCollectionStore();

  if (!cloudStoreResult.success) {
    return {
      success: false,
      data: null,
      error: cloudStoreResult.error,
    };
  }

  return cloudStoreResult.store.replaceCollection(
    localResult.data,
  );
}

export async function replaceLocalCollectionFromCloud(): Promise<CollectionStoreResult> {
  const cloudResult = await loadCloudCollection();

  if (!cloudResult.success) {
    return cloudResult;
  }

  return localCollectionStore.replaceCollection(
    cloudResult.data,
  );
}