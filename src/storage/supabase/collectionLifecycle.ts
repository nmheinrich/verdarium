import { supabase } from "@/lib/supabase.ts";

import type { SupabaseCollectionRow } from "./types";

export type CollectionLifecycleResult =
  | {
      success: true;
      data: SupabaseCollectionRow;
    }
  | {
      success: false;
      data: null;
      error: {
        code: string;
        message: string;
      };
    };

function failure(
  code: string,
  message: string,
): CollectionLifecycleResult {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}

async function getAuthenticatedUserId(): Promise<
  | {
      success: true;
      userId: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    }
> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      success: false,
      error: {
        code: "auth-check-failed",
        message: "Verdarium could not verify the signed-in user.",
      },
    };
  }

  if (!user) {
    return {
      success: false,
      error: {
        code: "unauthenticated",
        message: "A signed-in user is required for cloud storage.",
      },
    };
  }

  return {
    success: true,
    userId: user.id,
  };
}

async function findCollection(
  ownerId: string,
): Promise<CollectionLifecycleResult> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    return failure(
      "collection-read-failed",
      "Verdarium could not load the cloud collection.",
    );
  }

  if (!data) {
    return failure(
      "collection-not-found",
      "No cloud collection exists for this user yet.",
    );
  }

  return {
    success: true,
    data: data as SupabaseCollectionRow,
  };
}

async function createCollection(
  ownerId: string,
): Promise<CollectionLifecycleResult> {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      owner_id: ownerId,
      schema_version: 1,
    })
    .select("*")
    .single();

  if (error) {
    return failure(
      "collection-create-failed",
      "Verdarium could not create the cloud collection.",
    );
  }

  return {
    success: true,
    data: data as SupabaseCollectionRow,
  };
}

export async function getOrCreateCloudCollection(): Promise<CollectionLifecycleResult> {
  const authResult = await getAuthenticatedUserId();

  if (!authResult.success) {
    return {
      success: false,
      data: null,
      error: authResult.error,
    };
  }

  const existingCollection = await findCollection(
    authResult.userId,
  );

  if (existingCollection.success) {
    return existingCollection;
  }

  if (
    existingCollection.error.code !==
    "collection-not-found"
  ) {
    return existingCollection;
  }

  const createdCollection = await createCollection(
    authResult.userId,
  );

  if (createdCollection.success) {
    return createdCollection;
  }

  const retryCollection = await findCollection(
    authResult.userId,
  );

  if (retryCollection.success) {
    return retryCollection;
  }

  return createdCollection;
}