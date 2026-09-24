import { useAuth } from "@/auth/useAuth";
import {
  Button,
  Surface,
} from "@/components/ui";

export type ArchiveConnectionStatus =
  | "connecting"
  | "cloud"
  | "conflict"
  | "error";

interface AccountMenuProps {
  archiveStatus: ArchiveConnectionStatus;
  isSigningOut: boolean;
  warningMessage: string | null;
  onReviewConflict: () => void;
  onSignOut: () => void;
}

function getArchiveDescription(
  status: ArchiveConnectionStatus,
): string {
  switch (status) {
    case "connecting":
      return "Verdarium is opening your private botanical archive.";

    case "cloud":
      return "Your botanical collection is preserved in your private cloud archive.";

    case "conflict":
      return "A legacy browser collection differs from your private cloud archive. Both remain preserved until you choose which collection to keep.";

    case "error":
      return "The private cloud archive is not currently available. Verdarium has not changed its records.";
  }
}

function getArchiveStatusLabel(
  status: ArchiveConnectionStatus,
): string {
  switch (status) {
    case "connecting":
      return "Opening archive";

    case "cloud":
      return "Private cloud";

    case "conflict":
      return "Migration decision required";

    case "error":
      return "Cloud unavailable";
  }
}

export function AccountMenu({
  archiveStatus,
  isSigningOut,
  warningMessage,
  onReviewConflict,
  onSignOut,
}: AccountMenuProps) {
  const { state } = useAuth();

  const accountLabel =
    state.status === "signedIn"
      ? state.user.email ?? "Private account"
      : "Session unavailable";

  return (
    <Surface className="p-6 sm:p-8">
      <section aria-labelledby="settings-account-heading">
        <div className="max-w-2xl">
          <p className="metadata-label">
            Private archive
          </p>

          <h2
            id="settings-account-heading"
            className="mt-3 font-display type-title text-[var(--color-text-primary)]"
          >
            Account
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {getArchiveDescription(archiveStatus)}
          </p>
        </div>

        <dl className="mt-7 grid gap-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
          <div>
            <dt className="metadata-label">
              Identity
            </dt>

            <dd className="mt-2 break-words text-sm leading-6 text-[var(--color-text-secondary)]">
              {accountLabel}
            </dd>
          </div>

          <div>
            <dt className="metadata-label">
              Archive
            </dt>

            <dd className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {getArchiveStatusLabel(
                archiveStatus,
              )}
            </dd>
          </div>
        </dl>

        {warningMessage ? (
          <p
            role="alert"
            className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {warningMessage}
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-6">
          {archiveStatus === "conflict" ? (
            <Button
              type="button"
              onClick={onReviewConflict}
            >
              Review legacy collection
            </Button>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            disabled={isSigningOut}
            onClick={onSignOut}
          >
            {isSigningOut
              ? "Closing private session…"
              : "Sign out of this browser"}
          </Button>
        </div>
      </section>
    </Surface>
  );
}