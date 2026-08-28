import React, { useState } from "react";

import type {
  Specimen,
  SpecimenHealthStatus,
  SpecimenLightPreference,
} from "@/types";

import {
  Button,
  Input,
  Label,
  Surface,
} from "@/components/ui";
import { createId } from "@/lib";
import { addSpecimen } from "@/storage";

interface AddSpecimenFormProps {
  onCancel: () => void;
  onCreated: (specimens: Specimen[]) => void;
}

interface FormState {
  commonName: string;
  family: string;
  genus: string;
  species: string;
  cultivar: string;
  room: string;
  position: string;
  healthStatus: SpecimenHealthStatus;
  lightPreference: "" | SpecimenLightPreference;
  acquisitionDate: string;
  acquisitionSource: string;
  notes: string;
  tags: string;
  isFavorite: boolean;
}

interface FieldErrors {
  commonName?: string;
  genus?: string;
  species?: string;
}

const initialFormState: FormState = {
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
};

function buildScientificName({
  genus,
  species,
  cultivar,
}: Pick<FormState, "genus" | "species" | "cultivar">): string {
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
  formState: FormState,
): FieldErrors {
  const errors: FieldErrors = {};

  if (!formState.commonName.trim()) {
    errors.commonName = "Common name is required.";
  }

  if (!formState.genus.trim()) {
    errors.genus = "Genus is required.";
  }

  if (!formState.species.trim()) {
    errors.species = "Species is required.";
  }

  return errors;
}

export function AddSpecimenForm({
  onCancel,
  onCreated,
}: AddSpecimenFormProps) {
  const [formState, setFormState] = useState<FormState>(
    initialFormState,
  );

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

    const handleSubmit = (
      event: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0],
    ) => {
    event.preventDefault();

    const nextFieldErrors =
      validateRequiredFields(formState);

    setFieldErrors(nextFieldErrors);
    setSubmitError(null);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const timestamp = new Date().toISOString();

    const specimen: Specimen = {
      id: createId(),

      commonName: formState.commonName.trim(),
      scientificName: buildScientificName(formState),

      classification: {
        genus: formState.genus.trim(),
        species: formState.species.trim(),
      },

      healthStatus: formState.healthStatus,

      tags: parseTags(formState.tags),

      isFavorite: formState.isFavorite,

      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const family = formState.family.trim();

    if (family) {
      specimen.classification.family = family;
    }

    const cultivar = formState.cultivar.trim();

    if (cultivar) {
      specimen.classification.cultivar = cultivar;
    }

    const room = formState.room.trim();
    const position = formState.position.trim();

    if (room || position) {
      specimen.location = {};

      if (room) {
        specimen.location.room = room;
      }

      if (position) {
        specimen.location.position = position;
      }
    }

    if (formState.lightPreference) {
      specimen.lightPreference =
        formState.lightPreference;
    }

    if (formState.acquisitionDate) {
      specimen.acquisitionDate =
        formState.acquisitionDate;
    }

    const acquisitionSource =
      formState.acquisitionSource.trim();

    if (acquisitionSource) {
      specimen.acquisitionSource =
        acquisitionSource;
    }

    const notes = formState.notes.trim();

    if (notes) {
      specimen.notes = notes;
    }

    const result = addSpecimen(specimen);

    if (!result.success) {
      setSubmitError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    onCreated(result.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Surface className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">
            Specimen intake
          </p>

          <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
            Botanical identity
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Record the core botanical details for this
            specimen.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="common-name">
              Common name
            </Label>

            <Input
              id="common-name"
              value={formState.commonName}
              invalid={Boolean(fieldErrors.commonName)}
              aria-describedby={
                fieldErrors.commonName
                  ? "common-name-error"
                  : undefined
              }
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  commonName: event.target.value,
                }))
              }
            />

            {fieldErrors.commonName ? (
              <p
                id="common-name-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {fieldErrors.commonName}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="family">
              Family
            </Label>

            <Input
              id="family"
              value={formState.family}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  family: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="cultivar">
              Cultivar
            </Label>

            <Input
              id="cultivar"
              value={formState.cultivar}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  cultivar: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="genus">
              Genus
            </Label>

            <Input
              id="genus"
              value={formState.genus}
              invalid={Boolean(fieldErrors.genus)}
              aria-describedby={
                fieldErrors.genus
                  ? "genus-error"
                  : undefined
              }
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  genus: event.target.value,
                }))
              }
            />

            {fieldErrors.genus ? (
              <p
                id="genus-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {fieldErrors.genus}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="species">
              Species
            </Label>

            <Input
              id="species"
              value={formState.species}
              invalid={Boolean(fieldErrors.species)}
              aria-describedby={
                fieldErrors.species
                  ? "species-error"
                  : undefined
              }
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  species: event.target.value,
                }))
              }
            />

            {fieldErrors.species ? (
              <p
                id="species-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {fieldErrors.species}
              </p>
            ) : null}
          </div>
        </div>
      </Surface>

      <Surface className="mt-6 p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">
            Collection details
          </p>

          <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
            Placement and condition
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="room">
              Room
            </Label>

            <Input
              id="room"
              value={formState.room}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  room: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="position">
              Position
            </Label>

            <Input
              id="position"
              value={formState.position}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  position: event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="health-status">
              Health status
            </Label>

            <select
              id="health-status"
              value={formState.healthStatus}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  healthStatus:
                    event.target
                      .value as SpecimenHealthStatus,
                }))
              }
              className="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              <option value="unknown">Unknown</option>
              <option value="thriving">Thriving</option>
              <option value="stable">Stable</option>
              <option value="watch">Watch</option>
              <option value="recovering">
                Recovering
              </option>
            </select>
          </div>

          <div>
            <Label htmlFor="light-preference">
              Light preference
            </Label>

            <select
              id="light-preference"
              value={formState.lightPreference}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  lightPreference:
                    event.target
                      .value as FormState["lightPreference"],
                }))
              }
              className="min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              <option value="">
                Not recorded
              </option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="bright-indirect">
                Bright indirect
              </option>
              <option value="direct">Direct</option>
              <option value="unknown">
                Unknown
              </option>
            </select>
          </div>
        </div>
      </Surface>

      <Surface className="mt-6 p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">
            Archive record
          </p>

          <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
            Acquisition and notes
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="acquisition-date">
              Acquisition date
            </Label>

            <Input
              id="acquisition-date"
              type="date"
              value={formState.acquisitionDate}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  acquisitionDate:
                    event.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="acquisition-source">
              Acquisition source
            </Label>

            <Input
              id="acquisition-source"
              value={formState.acquisitionSource}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  acquisitionSource:
                    event.target.value,
                }))
              }
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="tags">
              Tags
            </Label>

            <Input
              id="tags"
              value={formState.tags}
              placeholder="aroid, tropical, indoor"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  tags: event.target.value,
                }))
              }
            />

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              Separate tags with commas.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="notes">
              Notes
            </Label>

            <textarea
              id="notes"
              rows={6}
              value={formState.notes}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={formState.isFavorite}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    isFavorite:
                      event.target.checked,
                  }))
                }
              />

              Mark as favorite
            </label>
          </div>
        </div>
      </Surface>

      {submitError ? (
        <Surface
          variant="subtle"
          className="mt-6 p-5"
          role="alert"
        >
          <p className="metadata-label">
            Unable to save specimen
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {submitError}
          </p>
        </Surface>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving specimen…"
            : "Add specimen"}
        </Button>
      </div>
    </form>
  );
}