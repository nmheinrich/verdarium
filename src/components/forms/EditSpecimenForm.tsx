import React, { useState } from "react";

import type { Specimen } from "@/types";

import { updateSpecimen } from "@/storage";

import {
  SpecimenForm,
  type SpecimenFormErrors,
  type SpecimenFormValues,
} from "./SpecimenForm";

interface EditSpecimenFormProps {
  specimen: Specimen;
  onCancel: () => void;
  onUpdated: (specimens: Specimen[]) => void;
}

function createInitialValues(
  specimen: Specimen,
): SpecimenFormValues {
  return {
    commonName: specimen.commonName,
    family: specimen.classification.family ?? "",
    genus: specimen.classification.genus,
    species: specimen.classification.species,
    cultivar: specimen.classification.cultivar ?? "",
    room: specimen.location?.room ?? "",
    position: specimen.location?.position ?? "",
    healthStatus: specimen.healthStatus,
    lightPreference: specimen.lightPreference ?? "",
    acquisitionDate: specimen.acquisitionDate ?? "",
    acquisitionSource: specimen.acquisitionSource ?? "",
    notes: specimen.notes ?? "",
    tags: specimen.tags.join(", "),
    isFavorite: specimen.isFavorite,
  };
}

function buildScientificName({
  genus,
  species,
  cultivar,
}: Pick<
  SpecimenFormValues,
  "genus" | "species" | "cultivar"
>): string {
  const baseName = `${genus.trim()} ${species.trim()}`.trim();

  const normalizedCultivar = cultivar.trim();

  return normalizedCultivar
    ? `${baseName} '${normalizedCultivar}'`
    : baseName;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function validateRequiredFields(
  values: SpecimenFormValues,
): SpecimenFormErrors {
  const errors: SpecimenFormErrors = {};

  if (!values.commonName.trim()) {
    errors.commonName = "Common name is required.";
  }

  if (!values.genus.trim()) {
    errors.genus = "Genus is required.";
  }

  if (!values.species.trim()) {
    errors.species = "Species is required.";
  }

  return errors;
}

export function EditSpecimenForm({
  specimen,
  onCancel,
  onUpdated,
}: EditSpecimenFormProps) {
  const [values, setValues] =
    useState<SpecimenFormValues>(() =>
      createInitialValues(specimen),
    );

  const [errors, setErrors] =
    useState<SpecimenFormErrors>({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = (
    event: Parameters<
      NonNullable<
        React.ComponentProps<"form">["onSubmit"]
      >
    >[0],
  ) => {
    event.preventDefault();

    const nextErrors = validateRequiredFields(values);

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const updatedSpecimen: Specimen = {
      ...specimen,

      commonName: values.commonName.trim(),
      scientificName: buildScientificName(values),

      classification: {
        genus: values.genus.trim(),
        species: values.species.trim(),
      },

      healthStatus: values.healthStatus,
      tags: parseTags(values.tags),
      isFavorite: values.isFavorite,

      updatedAt: new Date().toISOString(),
    };

    const family = values.family.trim();

    if (family) {
      updatedSpecimen.classification.family = family;
    }

    const cultivar = values.cultivar.trim();

    if (cultivar) {
      updatedSpecimen.classification.cultivar = cultivar;
    }

    const room = values.room.trim();
    const position = values.position.trim();

    if (room || position) {
      updatedSpecimen.location = {};

      if (room) {
        updatedSpecimen.location.room = room;
      }

      if (position) {
        updatedSpecimen.location.position = position;
      }
    } else {
      delete updatedSpecimen.location;
    }

    if (values.lightPreference) {
      updatedSpecimen.lightPreference =
        values.lightPreference;
    } else {
      delete updatedSpecimen.lightPreference;
    }

    if (values.acquisitionDate) {
      updatedSpecimen.acquisitionDate =
        values.acquisitionDate;
    } else {
      delete updatedSpecimen.acquisitionDate;
    }

    const acquisitionSource =
      values.acquisitionSource.trim();

    if (acquisitionSource) {
      updatedSpecimen.acquisitionSource =
        acquisitionSource;
    } else {
      delete updatedSpecimen.acquisitionSource;
    }

    const notes = values.notes.trim();

    if (notes) {
      updatedSpecimen.notes = notes;
    } else {
      delete updatedSpecimen.notes;
    }

    const result = updateSpecimen(updatedSpecimen);

    if (!result.success) {
      setSubmitError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    onUpdated(result.data);
  };

  return (
    <SpecimenForm
      values={values}
      errors={errors}
      submitError={submitError}
      submitLabel="Save changes"
      submittingLabel="Saving changes…"
      isSubmitting={isSubmitting}
      onChange={setValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}