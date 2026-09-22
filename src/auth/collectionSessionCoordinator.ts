import type { Specimen } from "@/types";

import { localCollectionStore } from "@/storage/localCollectionStore";
import { loadCloudCollection } from "@/storage/supabase/cloudCollectionStore";
import { replaceCloudCollectionFromLocal } from "@/storage/supabase/migrationActions";
import {
  inspectCollectionSyncState,
  type CollectionSyncState,
} from "@/storage/supabase/sync";

export type CollectionConflictChoice =
  | "browser"
  | "cloud";

export type CollectionSessionOutcome =
  | {
      status: "ready";
      specimens: Specimen[];
      legacyCleanupPending: boolean;
      warning: string | null;
    }
  | {
      status: "conflict";
      message: string;
    }
  | {
      status: "error";
      code: string;
      message: string;
    };

interface LegacyCleanupResult {
  pending: boolean;
  warning: string | null;
}

const conflictMessage =
  "A legacy collection in this browser differs from your private cloud archive. Verdarium has preserved both until you choose which collection to keep.";

const initializationErrorMessage =
  "Verdarium could not open the private cloud collection. The legacy browser archive remains unchanged.";

const migrationErrorMessage =
  "Verdarium could not migrate the legacy browser collection to the private cloud. The browser archive remains unchanged.";

const conflictResolutionErrorMessage =
  "Verdarium could not complete the archive selection. Both collections remain preserved, and you can try again.";

const cleanupWarningMessage =
  "The private cloud archive is ready, but Verdarium could not remove the legacy browser copy. Your cloud collection remains unchanged.";

function readyOutcome(
  specimens: Specimen[],
  cleanup: LegacyCleanupResult = {
    pending: false,
    warning: null,
  },
): CollectionSessionOutcome {
  return {
    status: "ready",
    specimens,
    legacyCleanupPending: cleanup.pending,
    warning: cleanup.warning,
  };
}

async function clearLegacyCollection(): Promise<LegacyCleanupResult> {
  const result =
    await localCollectionStore.replaceCollection([]);

  if (!result.success) {
    return {
      pending: true,
      warning: cleanupWarningMessage,
    };
  }

  return {
    pending: false,
    warning: null,
  };
}

async function migrateLegacyCollectionToCloud(): Promise<CollectionSessionOutcome> {
  const result =
    await replaceCloudCollectionFromLocal();

  if (!result.success) {
    return {
      status: "error",
      code: result.error.code,
      message: migrationErrorMessage,
    };
  }

  const cleanup = await clearLegacyCollection();

  return readyOutcome(result.data, cleanup);
}

async function prepareMatchingCloudCollection(
  state: Extract<
    CollectionSyncState,
    { status: "matching" }
  >,
): Promise<CollectionSessionOutcome> {
  const cleanup = await clearLegacyCollection();

  return readyOutcome(state.cloud, cleanup);
}

export async function initializeAuthenticatedCollection(): Promise<CollectionSessionOutcome> {
  const inspection =
    await inspectCollectionSyncState();

  if (!inspection.success) {
    return {
      status: "error",
      code: inspection.error.code,
      message: initializationErrorMessage,
    };
  }

  switch (inspection.data.status) {
    case "empty":
      return readyOutcome([]);

    case "cloud-only":
      return readyOutcome(inspection.data.cloud);

    case "matching":
      return prepareMatchingCloudCollection(
        inspection.data,
      );

    case "local-only":
      return migrateLegacyCollectionToCloud();

    case "conflict":
      return {
        status: "conflict",
        message: conflictMessage,
      };
  }
}

export async function resolveCollectionConflict(
  choice: CollectionConflictChoice,
): Promise<CollectionSessionOutcome> {
  if (choice === "browser") {
    const migration =
      await replaceCloudCollectionFromLocal();

    if (!migration.success) {
      return {
        status: "error",
        code: migration.error.code,
        message: conflictResolutionErrorMessage,
      };
    }

    const cleanup = await clearLegacyCollection();

    return readyOutcome(
      migration.data,
      cleanup,
    );
  }

  const cloudResult = await loadCloudCollection();

  if (!cloudResult.success) {
    return {
      status: "error",
      code: cloudResult.error.code,
      message: conflictResolutionErrorMessage,
    };
  }

  const cleanup = await clearLegacyCollection();

  return readyOutcome(
    cloudResult.data,
    cleanup,
  );
}