import { useState } from "react";

import { Button, Surface } from "@/components/ui";

interface DeleteAccountSectionProps {
  isDeleting: boolean;
  errorMessage: string | null;
  onConfirmDelete: () => void;
}

/**
 * The Settings danger zone: permanently deletes the account and every
 * specimen, care record and shared link tied to it. No soft delete —
 * confirming here is final (2026-09-24 decision).
 */
export function DeleteAccountSection({
  isDeleting,
  errorMessage,
  onConfirmDelete,
}: DeleteAccountSectionProps) {
  const [isConfirming, setIsConfirming] =
    useState(false);

  return (
    <Surface className="border-[var(--color-reminder-overdue)] p-6 sm:p-8">
      <section aria-labelledby="settings-delete-account-heading">
        <div className="max-w-2xl">
          <p className="metadata-label text-[var(--color-reminder-overdue-ink)]">
            Danger zone
          </p>

          <h2
            id="settings-delete-account-heading"
            className="mt-3 font-display type-title text-[var(--color-text-primary)]"
          >
            Delete account
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Permanently deletes your private account, your entire
            botanical archive, and its care history. Any shared link to
            this collection stops working immediately. This cannot be
            undone.
          </p>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-7 border-t border-[var(--color-border)] pt-6">
          {isConfirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm leading-6 text-[var(--color-text-primary)]">
                Delete the account and everything in it?
              </p>

              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isDeleting}
                  onClick={() =>
                    setIsConfirming(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={isDeleting}
                  className="border-[var(--color-reminder-overdue)] bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)] hover:brightness-95 active:brightness-90"
                  onClick={onConfirmDelete}
                >
                  {isDeleting
                    ? "Deleting account…"
                    : "Delete account permanently"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="border-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]"
              onClick={() =>
                setIsConfirming(true)
              }
            >
              Delete account
            </Button>
          )}
        </div>
      </section>
    </Surface>
  );
}
