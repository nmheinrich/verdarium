import type {
  BotanicalClassification,
  SpecimenHealthStatus,
  SpecimenLightPreference,
} from "@/types";

export interface SharedSpecimen {
  id: string;
  commonName: string;
  scientificName: string;
  classification: BotanicalClassification;
  healthStatus: SpecimenHealthStatus;
  lightPreference?: SpecimenLightPreference;
  tags: string[];
  illustrationKey?: string;
  isFavorite: boolean;
}

export interface SharedCollection {
  title?: string;
  description?: string;
  sharedAt: string;
  specimens: SharedSpecimen[];
}

export interface CollectionSharingState {
  enabled: boolean;
  token?: string;
  title?: string;
  description?: string;
  sharedAt?: string;
}

export interface UpdateCollectionSharingInput {
  enabled: boolean;
  title?: string;
  description?: string;
}