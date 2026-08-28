import type {
  SpecimenHealthStatus,
  SpecimenLightPreference,
} from "@/types";

import {
  Button,
  Input,
  Label,
  Surface,
} from "@/components/ui";

export interface SpecimenFormValues {
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

export interface SpecimenFormErrors {
  commonName?: string;
  genus?: string;
  species?: string;
}

interface SpecimenFormProps {
  values: SpecimenFormValues;
  errors: SpecimenFormErrors;
  submitError?: string | null;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting?: boolean;
  onChange: (values: SpecimenFormValues) => void;
  onSubmit: React.ComponentProps<"form">["onSubmit"];
  onCancel: () => void;
}

export function SpecimenForm({
  values,
  errors,
  submitError = null,
  submitLabel,
  submittingLabel,
  isSubmitting = false,
  onChange,
  onSubmit,
  onCancel,
}: SpecimenFormProps) {
  const updateField = <Key extends keyof SpecimenFormValues>(
    field: Key,
    value: SpecimenFormValues[Key],
  ) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <Surface className="p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="metadata-label">Specimen intake</p>

          <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
            Botanical identity
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Record the core botanical details for this specimen.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="common-name">Common name</Label>

            <Input
              id="common-name"
              value={values.commonName}
              invalid={Boolean(errors.commonName)}
              aria-describedby={
                errors.commonName
                  ? "common-name-error"
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  "commonName",
                  event.target.value,
                )
              }
            />

            {errors.commonName ? (
              <p
                id="common-name-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {errors.commonName}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="family">Family</Label>

            <Input
              id="family"
              value={values.family}
              onChange={(event) =>
                updateField(
                  "family",
                  event.target.value,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="cultivar">Cultivar</Label>

            <Input
              id="cultivar"
              value={values.cultivar}
              onChange={(event) =>
                updateField(
                  "cultivar",
                  event.target.value,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="genus">Genus</Label>

            <Input
              id="genus"
              value={values.genus}
              invalid={Boolean(errors.genus)}
              aria-describedby={
                errors.genus
                  ? "genus-error"
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  "genus",
                  event.target.value,
                )
              }
            />

            {errors.genus ? (
              <p
                id="genus-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {errors.genus}
              </p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="species">Species</Label>

            <Input
              id="species"
              value={values.species}
              invalid={Boolean(errors.species)}
              aria-describedby={
                errors.species
                  ? "species-error"
                  : undefined
              }
              onChange={(event) =>
                updateField(
                  "species",
                  event.target.value,
                )
              }
            />

            {errors.species ? (
              <p
                id="species-error"
                className="mt-2 text-sm text-[var(--color-text-secondary)]"
              >
                {errors.species}
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
            <Label htmlFor="room">Room</Label>

            <Input
              id="room"
              value={values.room}
              onChange={(event) =>
                updateField(
                  "room",
                  event.target.value,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="position">Position</Label>

            <Input
              id="position"
              value={values.position}
              onChange={(event) =>
                updateField(
                  "position",
                  event.target.value,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="health-status">
              Health status
            </Label>

            <select
              id="health-status"
              value={values.healthStatus}
              onChange={(event) =>
                updateField(
                  "healthStatus",
                  event.target.value as SpecimenHealthStatus,
                )
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
              value={values.lightPreference}
              onChange={(event) =>
                updateField(
                  "lightPreference",
                  event.target
                    .value as SpecimenFormValues["lightPreference"],
                )
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
              value={values.acquisitionDate}
              onChange={(event) =>
                updateField(
                  "acquisitionDate",
                  event.target.value,
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="acquisition-source">
              Acquisition source
            </Label>

            <Input
              id="acquisition-source"
              value={values.acquisitionSource}
              onChange={(event) =>
                updateField(
                  "acquisitionSource",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="tags">Tags</Label>

            <Input
              id="tags"
              value={values.tags}
              placeholder="aroid, tropical, indoor"
              onChange={(event) =>
                updateField(
                  "tags",
                  event.target.value,
                )
              }
            />

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              Separate tags with commas.
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>

            <textarea
              id="notes"
              rows={6}
              value={values.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={values.isFavorite}
                onChange={(event) =>
                  updateField(
                    "isFavorite",
                    event.target.checked,
                  )
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
            ? submittingLabel
            : submitLabel}
        </Button>
      </div>
    </form>
  );
}