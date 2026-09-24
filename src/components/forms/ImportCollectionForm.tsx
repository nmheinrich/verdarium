import {
  useEffect,
  useRef,
  useState,
} from "react";

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

function getInvalidArchiveMessage(): string {
  return "Verdarium could not validate the selected file as a compatible botanical archive. Your current collection has not been changed.";
}

function getImportSaveErrorMessage(): string {
  return "The archive was validated, but Verdarium could not save it to this browser. Your current collection remains unchanged.";
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

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const confirmationHeadingRef =
    useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!pendingImport) {
      return;
    }

    confirmationHeadingRef.current?.focus();
  }, [pendingImport]);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        "Verdarium could not read the selected file. Your current collection has not been changed.",
      );
      clearFileInput();
      return;
    }

    const result =
      parseImportedCollection(fileContents);

    if (!result.success) {
      setErrorMessage(
        getInvalidArchiveMessage(),
      );
      clearFileInput();
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
    clearFileInput();

    requestAnimationFrame(() => {
      fileInputRef.current?.focus();
    });
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
      setErrorMessage(
        getImportSaveErrorMessage(),
      );
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
    clearFileInput();
  };

  return (
    <section
      aria-labelledby="import-collection-heading"
    >
      <div className="max-w-2xl">
        <h3
          id="import-collection-heading"
          className="font-display type-subtitle text-[var(--color-text-primary)]"
        >
          Import archive
        </h3>

        <p
          id="import-collection-description"
          className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]"
        >
          Select a Verdarium JSON file to replace
          the current botanical archive. The file is
          validated before anything is written.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="collection-import-file"
          className="metadata-label"
        >
          Verdarium JSON file
        </label>

        <input
          ref={fileInputRef}
          id="collection-import-file"
          type="file"
          accept="application/json,.json"
          aria-describedby="import-collection-description"
          onChange={handleFileChange}
          className="mt-3 block w-full rounded-[var(--radius-sm)] text-sm text-[var(--color-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] file:mr-4 file:rounded-[var(--radius-sm)] file:border file:border-[var(--color-border-strong)] file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[var(--color-text-primary)] hover:file:border-[var(--color-botanical-muted)]"
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
          aria-labelledby="import-confirmation-heading"
        >
          <p className="metadata-label">
            Import ready
          </p>

          <h4
            ref={confirmationHeadingRef}
            id="import-confirmation-heading"
            tabIndex={-1}
            className="mt-2 font-display type-subtitle text-[var(--color-text-primary)]"
          >
            Replace the current collection?
          </h4>

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