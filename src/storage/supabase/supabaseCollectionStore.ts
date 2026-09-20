import { supabase } from "@/lib/supabase";
import type { Specimen } from "@/types";

import type {
  CollectionStore,
  CollectionStoreResult,
} from "../contracts";
import {
  fromSupabaseSpecimenRow,
  toSupabaseSpecimenRow,
} from "./specimenMapper";
import type { SupabaseSpecimenRow } from "./types";

function failure(
  code: string,
  message: string,
): CollectionStoreResult {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}

export function createSupabaseCollectionStore(
  collectionId: string,
): CollectionStore {
  return {
    async loadCollection(): Promise<CollectionStoreResult> {
      const { data, error } = await supabase
        .from("specimens")
        .select("*")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: true });

      if (error) {
        return failure(
          "remote-read-failed",
          "Verdarium could not load the cloud collection.",
        );
      }

      try {
        const specimens = (data ?? []).map((row) =>
          fromSupabaseSpecimenRow(
            row as SupabaseSpecimenRow,
          ),
        );

        return {
          success: true,
          data: specimens,
        };
      } catch {
        return failure(
          "invalid-remote-data",
          "Verdarium received invalid specimen data from cloud storage.",
        );
      }
    },

    async replaceCollection(
      specimens: Specimen[],
    ): Promise<CollectionStoreResult> {
      const rows = specimens.map((specimen) =>
        toSupabaseSpecimenRow(
          specimen,
          collectionId,
        ),
      );

      const { error } = await supabase.rpc(
        "replace_collection_specimens",
        {
          p_collection_id: collectionId,
          p_specimens: rows,
        },
      );

      if (error) {
        return failure(
          "remote-replace-failed",
          "Verdarium could not replace the cloud collection.",
        );
      }

      return this.loadCollection();
    },

    async addSpecimen(
      specimen: Specimen,
    ): Promise<CollectionStoreResult> {
      const row = toSupabaseSpecimenRow(
        specimen,
        collectionId,
      );

      const { error } = await supabase
        .from("specimens")
        .insert(row);

      if (error) {
        return failure(
          "remote-write-failed",
          "Verdarium could not save the specimen to cloud storage.",
        );
      }

      return this.loadCollection();
    },

    async updateSpecimen(
      specimen: Specimen,
    ): Promise<CollectionStoreResult> {
      const row = toSupabaseSpecimenRow(
        specimen,
        collectionId,
      );

      const { data, error } = await supabase
        .from("specimens")
        .update(row)
        .eq("id", specimen.id)
        .eq("collection_id", collectionId)
        .select("id");

      if (error) {
        return failure(
          "remote-write-failed",
          "Verdarium could not update the specimen in cloud storage.",
        );
      }

      if (!data || data.length === 0) {
        return failure(
          "specimen-not-found",
          "The specimen could not be found in the cloud collection.",
        );
      }

      return this.loadCollection();
    },

    async deleteSpecimen(
      specimenId: string,
    ): Promise<CollectionStoreResult> {
      const { data, error } = await supabase
        .from("specimens")
        .delete()
        .eq("id", specimenId)
        .eq("collection_id", collectionId)
        .select("id");

      if (error) {
        return failure(
          "remote-write-failed",
          "Verdarium could not remove the specimen from cloud storage.",
        );
      }

      if (!data || data.length === 0) {
        return failure(
          "specimen-not-found",
          "The specimen could not be found in the cloud collection.",
        );
      }

      return this.loadCollection();
    },
  };
}