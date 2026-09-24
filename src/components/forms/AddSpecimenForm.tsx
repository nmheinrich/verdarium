import React, { useState } from "react";

import { DEFAULT_ILLUSTRATION_KEY } from "@/constants/illustrations";
import { createId } from "@/lib";
import type { Specimen } from "@/types";

import {
  SpecimenForm,
  type SpecimenFormErrors,
  type SpecimenFormValues,
} from "./SpecimenForm";

export type AddSpecimenResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

interface AddSpecimenFormProps {
  onCancel: () => void;
  onCreate: (
    specimen: Specimen,
  ) => Promise<AddSpecimenResult>;
}

const initialValues: SpecimenFormValues = {
  commonName: "",
  family: "",
  genus: "",
  species: "",
  cultivar: "",
  room: "",
  position: "",
  healthStatus: "unknown",
  lightPreference: "",
  acquisitionDate: "",
  acquisitionSource: "",
  notes: "",
  tags: "",
  isFavorite: false,
  illustrationKey: DEFAULT_ILLUSTRATION_KEY,
};

function buildScientificName({
  genus,
  species,
  cultivar,
}: Pick<
  SpecimenFormValues,
  "genus" | "species" | "cultivar"
>): string {
  const baseName =
    `${genus.trim()} ${species.trim()}`.trim();

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

function getAddSpecimenErrorMessage(): string {
  return "Verdarium could not save this specimen to the private archive. Your entered information has been preserved so you can try again.";
}

export function AddSpecimenForm({
  onCancel,
  onCreate,
}: AddSpecimenFormProps) {
  const [values, setValues] =
    useState<SpecimenFormValues>(initialValues);

  const [errors, setErrors] =
    useState<SpecimenFormErrors>({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: Parameters<
      NonNullable<
        React.ComponentProps<"form">["onSubmit"]
      >
    >[0],
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateRequiredFields(values);

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const timestamp = new Date().toISOString();

    const specimen: Specimen = {
      id: createId(),
      commonName: values.commonName.trim(),
      scientificName: buildScientificName(values),
      classification: {
        genus: values.genus.trim(),
        species: values.species.trim(),
      },
      healthStatus: values.healthStatus,
      tags: parseTags(values.tags),
      isFavorite: values.isFavorite,
      illustrationKey: values.illustrationKey,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const family = values.family.trim();

    if (family) {
      specimen.classification.family = family;
    }

    const cultivar = values.cultivar.trim();

    if (cultivar) {
      specimen.classification.cultivar =
        cultivar;
    }

    const room = values.room.trim();
    const position = values.position.trim();

    if (room || position) {
      specimen.location = {};

      if (room) {
        specimen.location.room = room;
      }

      if (position) {
        specimen.location.position = position;
      }
    }

    if (values.lightPreference) {
      specimen.lightPreference =
        values.lightPreference;
    }

    if (values.acquisitionDate) {
      specimen.acquisitionDate =
        values.acquisitionDate;
    }

    const acquisitionSource =
      values.acquisitionSource.trim();

    if (acquisitionSource) {
      specimen.acquisitionSource =
        acquisitionSource;
    }

    const notes = values.notes.trim();

    if (notes) {
      specimen.notes = notes;
    }

    try {
      const result = await onCreate(specimen);

      if (!result.success) {
        setSubmitError(
          result.message ||
            getAddSpecimenErrorMessage(),
        );
        setIsSubmitting(false);
        return;
      }
    } catch {
      setSubmitError(
        getAddSpecimenErrorMessage(),
      );
      setIsSubmitting(false);
    }
  };

  return (
    <SpecimenForm
      values={values}
      errors={errors}
      submitError={submitError}
      submitLabel="Add specimen"
      submittingLabel="Saving specimen…"
      isSubmitting={isSubmitting}
      onChange={setValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}