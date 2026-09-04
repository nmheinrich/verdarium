import { useState } from "react";

import {
  Button,
  Surface,
} from "@/components/ui";
import {
  parseImportedCollection,
  saveCollection,
} from "@/storage";
import type { Specimen } from "@/types";

interface ImportCollectionFormProps {
  onImported: (specimens: Specimen[]) => void;
}

interface PendingImport {
  fileName: string;
  specimens: Specimen[];
}

export function ImportCollectionForm({
  onImported,
}: ImportCollectionFormProps) {
  const [pendingImport, setPendingImport] =
    useState<PendingImport | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [isImporting, setIsImporting] =
    useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    setPendingImport(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!file) {
      return;
    }

    let fileContents: string;

    try {
      fileContents = await file.text();
    } catch {
      setErrorMessage(
        "Verdarium could not read the selected file.",
      );
      return;
    }

    const result =
      parseImportedCollection(fileContents);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    setPendingImport({
      fileName: file.name,
      specimens: result.data,
    });
  };

  const handleCancelImport = () => {
    setPendingImport(null);
    setErrorMessage(null);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) {
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = saveCollection(
      pendingImport.specimens,
    );

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsImporting(false);
      return;
    }

    onImported(result.data);

    setSuccessMessage(
      `Imported ${result.data.length} ${
        result.data.length === 1
          ? "specimen"
          : "specimens"
      } successfully.`,
    );

    setPendingImport(null);
    setIsImporting(false);
  };

  return (
    <section
      aria-labelledby="import-collection-heading"
    >
      <div className="max-w-2xl">
        <p className="metadata-label">
          Collection data
        </p>

        <h2
          id="import-collection-heading"
          className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
        >
          Import collection
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Select a Verdarium JSON file to replace the
          current botanical archive. The file is
          validated before anything is written.
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor="collection-import-file"
          className="metadata-label"
        >
          Verdarium JSON file
        </label>

        <input
          id="collection-import-file"
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="mt-3 block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:rounded-[var(--radius-sm)] file:border file:border-[var(--color-border-strong)] file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[var(--color-text-primary)] hover:file:border-[var(--color-botanical-muted)]"
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p
          role="status"
          className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          {successMessage}
        </p>
      ) : null}

      {pendingImport ? (
        <Surface
          variant="subtle"
          className="mt-6 p-5"
        >
          <p className="metadata-label">
            Import ready
          </p>

          <h3 className="mt-2 font-serif text-xl leading-tight text-[var(--color-text-primary)]">
            Replace the current collection?
          </h3>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            <span className="font-medium text-[var(--color-text-primary)]">
              {pendingImport.fileName}
            </span>{" "}
            contains {pendingImport.specimens.length}{" "}
            {pendingImport.specimens.length === 1
              ? "specimen"
              : "specimens"}
            . Importing will replace the existing
            botanical archive.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelImport}
              disabled={isImporting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting}
            >
              {isImporting
                ? "Importing…"
                : "Replace collection"}
            </Button>
          </div>
        </Surface>
      ) : null}
    </section>
  );
}