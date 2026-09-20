import type { Specimen } from "@/types";

import { localCollectionStore } from "../localCollectionStore";
import { loadCloudCollection } from "./cloudCollectionStore";

export type CollectionSyncState =
  | {
      status: "local-only";
      local: Specimen[];
      cloud: [];
    }
  | {
      status: "cloud-only";
      local: [];
      cloud: Specimen[];
    }
  | {
      status: "empty";
      local: [];
      cloud: [];
    }
  | {
      status: "matching";
      local: Specimen[];
      cloud: Specimen[];
    }
  | {
      status: "conflict";
      local: Specimen[];
      cloud: Specimen[];
    };

export type CollectionSyncResult =
  | {
      success: true;
      data: CollectionSyncState;
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
      };
    };

function serializeForComparison(
  specimens: Specimen[],
): string {
  const normalized = [...specimens]
    .sort((left, right) =>
      left.id.localeCompare(right.id),
    )
    .map((specimen) => ({
      ...specimen,
      tags: [...specimen.tags].sort(),
    }));

  return JSON.stringify(normalized);
}

function collectionsMatch(
  local: Specimen[],
  cloud: Specimen[],
): boolean {
  return (
    serializeForComparison(local) ===
    serializeForComparison(cloud)
  );
}

export async function inspectCollectionSyncState(): Promise<CollectionSyncResult> {
  const localResult =
    await localCollectionStore.loadCollection();

  if (!localResult.success) {
    return {
      success: false,
      data: null,
      error: {
        code: localResult.error.code,
        message:
          "Verdarium could not inspect the local collection.",
      },
    };
  }

  const cloudResult = await loadCloudCollection();

  if (!cloudResult.success) {
    return {
      success: false,
      data: null,
      error: cloudResult.error,
    };
  }

  const local = localResult.data;
  const cloud = cloudResult.data;

  if (local.length === 0 && cloud.length === 0) {
    return {
      success: true,
      data: {
        status: "empty",
        local: [],
        cloud: [],
      },
    };
  }

  if (local.length > 0 && cloud.length === 0) {
    return {
      success: true,
      data: {
        status: "local-only",
        local,
        cloud: [],
      },
    };
  }

  if (local.length === 0 && cloud.length > 0) {
    return {
      success: true,
      data: {
        status: "cloud-only",
        local: [],
        cloud,
      },
    };
  }

  if (collectionsMatch(local, cloud)) {
    return {
      success: true,
      data: {
        status: "matching",
        local,
        cloud,
      },
    };
  }

  return {
    success: true,
    data: {
      status: "conflict",
      local,
      cloud,
    },
  };
}