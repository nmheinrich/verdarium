import type { SpecimenReminder } from './reminder';

export type SpecimenHealthStatus =
  | 'thriving'
  | 'stable'
  | 'watch'
  | 'recovering'
  | 'unknown';

export type SpecimenLightPreference =
  | 'low'
  | 'medium'
  | 'bright-indirect'
  | 'direct'
  | 'unknown';

export interface BotanicalClassification {
  family?: string;
  genus: string;
  species: string;
  cultivar?: string;
}

export interface SpecimenLocation {
  room?: string;
  position?: string;
}

export interface Specimen {
  id: string;

  commonName: string;
  scientificName: string;

  classification: BotanicalClassification;

  location?: SpecimenLocation;

  healthStatus: SpecimenHealthStatus;
  lightPreference?: SpecimenLightPreference;

  acquisitionDate?: string;
  acquisitionSource?: string;

  notes?: string;
  tags: string[];

  illustrationKey?: string;

  reminder?: SpecimenReminder;

  isFavorite: boolean;

  createdAt: string;
  updatedAt: string;
}