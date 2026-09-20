export interface SupabaseCollectionRow {
  id: string;
  owner_id: string;
  schema_version: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSpecimenRow {
  id: string;
  collection_id: string;

  common_name: string;
  scientific_name: string;

  classification: unknown;
  location: unknown | null;

  health_status: string;
  light_preference: string | null;

  acquisition_date: string | null;
  acquisition_source: string | null;

  notes: string | null;
  tags: string[];

  illustration_key: string | null;
  reminder: unknown | null;

  is_favorite: boolean;

  created_at: string;
  updated_at: string;
}