import type { Specimen } from "@/types";

export type SpecimenSortOption =
  | "updated-desc"
  | "created-desc"
  | "name-asc"
  | "name-desc"
  | "scientific-asc";

export const DEFAULT_SPECIMEN_SORT: SpecimenSortOption =
  "updated-desc";

export function sortSpecimens(
  specimens: Specimen[],
  sortOption: SpecimenSortOption,
): Specimen[] {
  const sortedSpecimens = [...specimens];

  switch (sortOption) {
    case "updated-desc":
      return sortedSpecimens.sort(
        (firstSpecimen, secondSpecimen) =>
          new Date(secondSpecimen.updatedAt).getTime() -
          new Date(firstSpecimen.updatedAt).getTime(),
      );

    case "created-desc":
      return sortedSpecimens.sort(
        (firstSpecimen, secondSpecimen) =>
          new Date(secondSpecimen.createdAt).getTime() -
          new Date(firstSpecimen.createdAt).getTime(),
      );

    case "name-asc":
      return sortedSpecimens.sort((firstSpecimen, secondSpecimen) =>
        firstSpecimen.commonName.localeCompare(
          secondSpecimen.commonName,
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );

    case "name-desc":
      return sortedSpecimens.sort((firstSpecimen, secondSpecimen) =>
        secondSpecimen.commonName.localeCompare(
          firstSpecimen.commonName,
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );

    case "scientific-asc":
      return sortedSpecimens.sort((firstSpecimen, secondSpecimen) =>
        firstSpecimen.scientificName.localeCompare(
          secondSpecimen.scientificName,
          undefined,
          {
            sensitivity: "base",
          },
        ),
      );
  }
}