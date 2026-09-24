import {
  Archive,
  LockKeyhole,
} from "lucide-react";

import { useAuth } from "@/auth/useAuth";
import { PageHeader } from "@/components/layout";
import {
  Button,
  Surface,
} from "@/components/ui";

interface ArchiveEntryProps {
  onOpenAuth: () => void;
}

export function ArchiveEntry({
  onOpenAuth,
}: ArchiveEntryProps) {
  const { state } = useAuth();

  const isInitializing =
    state.status === "initializing";

  return (
    <>
      <PageHeader
        eyebrow="Private Botanical Archive"
        title="Verdarium"
        description="A quiet, enduring collection for documenting, studying, and caring for botanical specimens."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Surface className="overflow-hidden p-7 sm:p-10">
          <div className="max-w-2xl">
            <Archive
              size={24}
              aria-hidden="true"
              className="text-[var(--color-text-muted)]"
            />

            <p className="metadata-label mt-8">
              Collection access
            </p>

            <h2 className="mt-3 max-w-xl font-display type-headline text-[var(--color-text-primary)]">
              Enter your personal herbarium
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
              Your botanical records are preserved in a
              private cloud archive and become available
              after you identify yourself.
            </p>

            <div className="mt-8">
              <Button
                type="button"
                disabled={isInitializing}
                onClick={onOpenAuth}
              >
                {isInitializing
                  ? "Checking private session…"
                  : "Sign in or create account"}
              </Button>
            </div>

            {state.status === "error" ? (
              <p
                role="alert"
                className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]"
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </Surface>

        <Surface
          variant="subtle"
          className="p-7 sm:p-8"
        >
          <LockKeyhole
            size={20}
            aria-hidden="true"
            className="text-[var(--color-text-muted)]"
          />

          <p className="metadata-label mt-7">
            Private by design
          </p>

          <h2 className="mt-3 font-display type-title text-[var(--color-text-primary)]">
            One account, one collection
          </h2>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Verdarium keeps each botanical archive
            separate and grants access only to its owner.
            Legacy browser collections are preserved until
            their migration is complete.
          </p>
        </Surface>
      </div>
    </>
  );
}