import type { Specimen } from "@/types";

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

function getSearchableValues(specimen: Specimen): string[] {
  return [
    specimen.commonName,
    specimen.scientificName,
    specimen.classification.family ?? "",
    specimen.classification.genus,
    specimen.classification.species,
    specimen.classification.cultivar ?? "",
    specimen.location?.room ?? "",
    specimen.location?.position ?? "",
    specimen.acquisitionSource ?? "",
    ...specimen.tags,
  ];
}

export function searchSpecimens(
  specimens: Specimen[],
  query: string,
): Specimen[] {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return specimens;
  }

  return specimens.filter((specimen) =>
    getSearchableValues(specimen).some((value) =>
      normalizeSearchValue(value).includes(normalizedQuery),
    ),
  );
}