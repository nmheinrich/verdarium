import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui";
import { createCollectionExport } from "@/storage";
import type { Specimen } from "@/types";

interface ExportCollectionFormProps {
  specimens: Specimen[];
}

function createExportFileName(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    today.getDate(),
  ).padStart(2, "0");

  return `verdarium-collection-${year}-${month}-${day}.json`;
}

export function ExportCollectionForm({
  specimens,
}: ExportCollectionFormProps) {
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const handleExport = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result =
      createCollectionExport(specimens);

    if (!result.success) {
      setErrorMessage(result.error.message);
      return;
    }

    const blob = new Blob(
      [result.data],
      {
        type: "application/json",
      },
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = downloadUrl;
    anchor.download =
      createExportFileName();

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(downloadUrl);

    setSuccessMessage(
      `Exported ${specimens.length} ${
        specimens.length === 1
          ? "specimen"
          : "specimens"
      } successfully.`,
    );
  };

  return (
    <section
      aria-labelledby="export-collection-heading"
    >
      <div className="max-w-2xl">
        <p className="metadata-label">
          Collection data
        </p>

        <h2
          id="export-collection-heading"
          className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
        >
          Export collection
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Download a portable JSON backup of
          your current botanical archive.
        </p>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          leadingIcon={
            <Download size={16} />
          }
          onClick={handleExport}
        >
          Export JSON
        </Button>
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
    </section>
  );
}