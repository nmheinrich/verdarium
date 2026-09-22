import { supabase } from "@/lib/supabase";

import type {
  BotanicalClassification,
  SpecimenHealthStatus,
  SpecimenLightPreference,
} from "@/types";

import type {
  CollectionSharingState,
  SharedCollection,
  SharedSpecimen,
  UpdateCollectionSharingInput,
} from "./types";

export interface SharingError {
  code: string;
  message: string;
}

export type SharingResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: SharingError;
    };

interface RecordShape {
  [key: string]: unknown;
}

const HEALTH_STATUSES: readonly SpecimenHealthStatus[] = [
  "thriving",
  "stable",
  "watch",
  "recovering",
  "unknown",
];

const LIGHT_PREFERENCES: readonly SpecimenLightPreference[] = [
  "low",
  "medium",
  "bright-indirect",
  "direct",
  "unknown",
];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createSharingError(
  code: string,
  message: string,
): SharingError {
  return {
    code,
    message,
  };
}

function isRecord(value: unknown): value is RecordShape {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getOptionalString(
  value: unknown,
): string | undefined {
  return typeof value === "string" && value.length > 0
    ? value
    : undefined;
}

function isHealthStatus(
  value: unknown,
): value is SpecimenHealthStatus {
  return (
    typeof value === "string" &&
    HEALTH_STATUSES.includes(
      value as SpecimenHealthStatus,
    )
  );
}

function isLightPreference(
  value: unknown,
): value is SpecimenLightPreference {
  return (
    typeof value === "string" &&
    LIGHT_PREFERENCES.includes(
      value as SpecimenLightPreference,
    )
  );
}

function parseClassification(
  value: unknown,
): BotanicalClassification | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.genus !== "string" ||
    typeof value.species !== "string"
  ) {
    return null;
  }

  const family = getOptionalString(value.family);
  const cultivar = getOptionalString(value.cultivar);

  return {
    genus: value.genus,
    species: value.species,
    ...(family ? { family } : {}),
    ...(cultivar ? { cultivar } : {}),
  };
}

function parseTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (
    !value.every(
      (tag) => typeof tag === "string",
    )
  ) {
    return null;
  }

  return value;
}

function parseSharedSpecimen(
  value: unknown,
): SharedSpecimen | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.commonName !== "string" ||
    typeof value.scientificName !== "string" ||
    typeof value.isFavorite !== "boolean" ||
    !isHealthStatus(value.healthStatus)
  ) {
    return null;
  }

  const classification = parseClassification(
    value.classification,
  );

  const tags = parseTags(value.tags);

  if (!classification || !tags) {
    return null;
  }

  const lightPreference = isLightPreference(
    value.lightPreference,
  )
    ? value.lightPreference
    : undefined;

  const illustrationKey = getOptionalString(
    value.illustrationKey,
  );

  return {
    id: value.id,
    commonName: value.commonName,
    scientificName: value.scientificName,
    classification,
    healthStatus: value.healthStatus,
    tags,
    isFavorite: value.isFavorite,
    ...(lightPreference
      ? { lightPreference }
      : {}),
    ...(illustrationKey
      ? { illustrationKey }
      : {}),
  };
}

function parseSharedCollection(
  value: unknown,
): SharedCollection | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.sharedAt !== "string" ||
    !Array.isArray(value.specimens)
  ) {
    return null;
  }

  const specimens: SharedSpecimen[] = [];

  for (const specimen of value.specimens) {
    const parsedSpecimen =
      parseSharedSpecimen(specimen);

    if (!parsedSpecimen) {
      return null;
    }

    specimens.push(parsedSpecimen);
  }

  const title = getOptionalString(value.title);
  const description = getOptionalString(
    value.description,
  );

  return {
    sharedAt: value.sharedAt,
    specimens,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  };
}

function parseSharingState(
  value: unknown,
): CollectionSharingState | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.enabled !== "boolean") {
    return null;
  }

  const token = getOptionalString(value.token);
  const title = getOptionalString(value.title);
  const description = getOptionalString(
    value.description,
  );
  const sharedAt = getOptionalString(
    value.sharedAt,
  );

  if (
    value.enabled &&
    (!token || !sharedAt)
  ) {
    return null;
  }

  if (
    !value.enabled &&
    (token || sharedAt)
  ) {
    return null;
  }

  return {
    enabled: value.enabled,
    ...(token ? { token } : {}),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(sharedAt ? { sharedAt } : {}),
  };
}

function parseStoredSharingState(
  value: unknown,
): CollectionSharingState | null {
  if (!isRecord(value)) {
    return null;
  }

  return parseSharingState({
    enabled: value.sharing_enabled,
    token: value.share_token,
    title: value.shared_title,
    description: value.shared_description,
    sharedAt: value.shared_at,
  });
}

function normalizeSharingError(
  code: string,
): SharingError {
  switch (code) {
    case "PGRST301":
    case "42501":
      return createSharingError(
        code,
        "Verdarium could not verify access to this collection. Please sign in again and retry.",
      );

    default:
      return createSharingError(
        code,
        "Verdarium could not update collection sharing. Please try again.",
      );
  }
}

export async function loadCollectionSharingState(): Promise<
  SharingResult<CollectionSharingState>
> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select(
        [
          "sharing_enabled",
          "share_token",
          "shared_title",
          "shared_description",
          "shared_at",
        ].join(","),
      )
      .maybeSingle();

    if (error) {
      return {
        success: false,
        error: normalizeSharingError(
          error.code ||
            "sharing_state_load_failed",
        ),
      };
    }

    if (!data) {
      return {
        success: false,
        error: createSharingError(
          "collection_not_found",
          "Verdarium could not locate the private collection.",
        ),
      };
    }

    const sharingState =
      parseStoredSharingState(data);

    if (!sharingState) {
      return {
        success: false,
        error: createSharingError(
          "invalid_sharing_state",
          "Verdarium received an unexpected sharing record.",
        ),
      };
    }

    return {
      success: true,
      data: sharingState,
    };
  } catch {
    return {
      success: false,
      error: createSharingError(
        "sharing_state_network_error",
        "Verdarium could not reach the private archive. Please check your connection and try again.",
      ),
    };
  }
}

export async function updateCollectionSharing(
  input: UpdateCollectionSharingInput,
): Promise<
  SharingResult<CollectionSharingState>
> {
  try {
    const { data, error } = await supabase.rpc(
      "set_collection_sharing",
      {
        p_enabled: input.enabled,
        p_shared_title:
          input.title?.trim() || null,
        p_shared_description:
          input.description?.trim() || null,
      },
    );

    if (error) {
      return {
        success: false,
        error: normalizeSharingError(
          error.code ||
            "sharing_update_failed",
        ),
      };
    }

    const sharingState =
      parseSharingState(data);

    if (!sharingState) {
      return {
        success: false,
        error: createSharingError(
          "invalid_sharing_response",
          "Verdarium received an unexpected response while updating collection sharing. Please try again.",
        ),
      };
    }

    return {
      success: true,
      data: sharingState,
    };
  } catch {
    return {
      success: false,
      error: createSharingError(
        "sharing_network_error",
        "Verdarium could not reach the archive. Please check your connection and try again.",
      ),
    };
  }
}

export async function loadSharedCollection(
  shareToken: string,
): Promise<SharingResult<SharedCollection>> {
  const normalizedToken =
    shareToken.trim();

  if (
    !UUID_PATTERN.test(normalizedToken)
  ) {
    return {
      success: false,
      error: createSharingError(
        "shared_collection_unavailable",
        "This botanical archive is unavailable or is no longer being shared.",
      ),
    };
  }

  try {
    const { data, error } = await supabase.rpc(
      "get_shared_collection",
      {
        p_share_token: normalizedToken,
      },
    );

    if (error) {
      return {
        success: false,
        error: createSharingError(
          "shared_collection_unavailable",
          "This botanical archive is unavailable or is no longer being shared.",
        ),
      };
    }

    if (data === null) {
      return {
        success: false,
        error: createSharingError(
          "shared_collection_unavailable",
          "This botanical archive is unavailable or is no longer being shared.",
        ),
      };
    }

    const sharedCollection =
      parseSharedCollection(data);

    if (!sharedCollection) {
      return {
        success: false,
        error: createSharingError(
          "invalid_shared_collection_response",
          "Verdarium could not open this botanical archive.",
        ),
      };
    }

    return {
      success: true,
      data: sharedCollection,
    };
  } catch {
    return {
      success: false,
      error: createSharingError(
        "shared_collection_network_error",
        "Verdarium could not reach this botanical archive. Please check your connection and try again.",
      ),
    };
  }
}