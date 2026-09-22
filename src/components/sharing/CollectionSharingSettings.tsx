import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  LockKeyhole,
} from "lucide-react";

import {
  Button,
  Input,
  Label,
  Surface,
} from "@/components/ui";

import {
  loadCollectionSharingState,
  updateCollectionSharing,
} from "@/sharing/sharingService";

import type {
  CollectionSharingState,
  UpdateCollectionSharingInput,
} from "@/sharing/types";

const SHARED_TITLE_MAX_LENGTH = 120;
const SHARED_DESCRIPTION_MAX_LENGTH = 500;

function buildSharingUrl(
  token: string,
): string {
  return `${window.location.origin}/shared/${token}`;
}

export function CollectionSharingSettings() {
  const [sharingState, setSharingState] =
    useState<CollectionSharingState | null>(
      null,
    );

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [isConfirmingRevoke, setIsConfirmingRevoke] =
    useState(false);

  const [message, setMessage] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [hasCopied, setHasCopied] =
    useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadSharingState() {
      const result =
        await loadCollectionSharingState();

      if (!isActive) {
        return;
      }

      if (!result.success) {
        setErrorMessage(result.error.message);
        setIsLoading(false);
        return;
      }

      setSharingState(result.data);
      setTitle(result.data.title ?? "");
      setDescription(
        result.data.description ?? "",
      );
      setIsLoading(false);
    }

    void loadSharingState();

    return () => {
      isActive = false;
    };
  }, []);

  const sharingUrl = useMemo(() => {
    if (
      !sharingState?.enabled ||
      !sharingState.token
    ) {
      return null;
    }

    return buildSharingUrl(
      sharingState.token,
    );
  }, [sharingState]);

  const hasMetadataChanges =
    sharingState !== null &&
    (
      title.trim() !==
        (sharingState.title ?? "") ||
      description.trim() !==
        (sharingState.description ?? "")
    );

  async function saveSharingState(
    input: UpdateCollectionSharingInput,
    successMessage: string,
  ) {
    setIsSaving(true);
    setErrorMessage(null);
    setMessage(null);
    setHasCopied(false);

    const result =
      await updateCollectionSharing(input);

    if (!result.success) {
      setErrorMessage(result.error.message);
      setIsSaving(false);
      return false;
    }

    setSharingState(result.data);
    setTitle(result.data.title ?? "");
    setDescription(
      result.data.description ?? "",
    );
    setMessage(successMessage);
    setIsSaving(false);

    return true;
  }

  async function handleEnableSharing() {
    await saveSharingState(
      {
        enabled: true,
        title,
        description,
      },
      "A read-only sharing link has been created.",
    );
  }

  async function handleSaveMetadata() {
    if (!sharingState?.enabled) {
      return;
    }

    await saveSharingState(
      {
        enabled: true,
        title,
        description,
      },
      "Shared collection details have been updated.",
    );
  }

  async function handleRevokeSharing() {
    const didRevoke =
      await saveSharingState(
        {
          enabled: false,
          title,
          description,
        },
        "Sharing has been stopped. The previous link can no longer open this collection.",
      );

    if (didRevoke) {
      setIsConfirmingRevoke(false);
    }
  }

  async function handleCopyLink() {
    if (!sharingUrl) {
      return;
    }

    setErrorMessage(null);
    setMessage(null);
    setHasCopied(false);

    try {
      await navigator.clipboard.writeText(
        sharingUrl,
      );

      setHasCopied(true);
      setMessage(
        "Sharing link copied to the clipboard.",
      );
    } catch {
      setErrorMessage(
        "Verdarium could not copy the link automatically. You can select and copy it manually.",
      );
    }
  }

  if (isLoading) {
    return (
      <Surface className="p-6 sm:p-8">
        <section
          aria-labelledby="collection-sharing-heading"
          aria-busy="true"
        >
          <p className="metadata-label">
            Read-only access
          </p>

          <h2
            id="collection-sharing-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Collection sharing
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Verdarium is reading the sharing
            status of your botanical archive.
          </p>
        </section>
      </Surface>
    );
  }

  return (
    <Surface className="p-6 sm:p-8">
      <section
        aria-labelledby="collection-sharing-heading"
      >
        <div className="max-w-2xl">
          <p className="metadata-label">
            Read-only access
          </p>

          <h2
            id="collection-sharing-heading"
            className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Collection sharing
          </h2>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {sharingState?.enabled
              ? "Your botanical collection can be viewed by anyone who has its sharing link. Private notes, locations, acquisition details, and care records remain concealed."
              : "Your botanical collection is private. Create a read-only link when you would like someone to view its public botanical record."}
          </p>
        </div>

        <div className="mt-7 grid gap-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
          <div>
            <p className="metadata-label">
              Archive
            </p>

            <div className="mt-2 flex items-center gap-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {sharingState?.enabled ? (
                <Link2
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
              ) : (
                <LockKeyhole
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
              )}

              <span>
                {sharingState?.enabled
                  ? "Shared by link"
                  : "Private"}
              </span>
            </div>
          </div>

          <div>
            <p className="metadata-label">
              Visibility
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Botanical record only
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5 border-t border-[var(--color-border)] pt-6">
          <div>
            <Label htmlFor="shared-collection-title">
              Public title
            </Label>

            <Input
              id="shared-collection-title"
              className="mt-2"
              value={title}
              maxLength={
                SHARED_TITLE_MAX_LENGTH
              }
              disabled={isSaving}
              placeholder="My Botanical Collection"
              onChange={(event) => {
                setTitle(event.target.value);
                setMessage(null);
              }}
            />

            <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
              Optional. Your account identity
              is never used as the public title.
            </p>
          </div>

          <div>
            <Label htmlFor="shared-collection-description">
              Public description
            </Label>

            <textarea
              id="shared-collection-description"
              value={description}
              maxLength={
                SHARED_DESCRIPTION_MAX_LENGTH
              }
              disabled={isSaving}
              rows={4}
              placeholder="A short introduction to this botanical archive."
              className="mt-2 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm leading-6 text-[var(--color-text-primary)] shadow-none transition-[background-color,border-color,color] duration-[var(--transition-base)] ease-[var(--ease-standard)] placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] focus-visible:border-[var(--color-focus)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:cursor-not-allowed disabled:bg-[var(--color-background)] disabled:text-[var(--color-text-muted)] disabled:opacity-70"
              onChange={(event) => {
                setDescription(
                  event.target.value,
                );
                setMessage(null);
              }}
            />

            <div className="mt-2 flex justify-between gap-4 text-xs leading-5 text-[var(--color-text-muted)]">
              <span>
                Optional archival context for
                visitors.
              </span>

              <span>
                {description.length}/
                {
                  SHARED_DESCRIPTION_MAX_LENGTH
                }
              </span>
            </div>
          </div>
        </div>

        {sharingUrl ? (
          <div className="mt-7 border-t border-[var(--color-border)] pt-6">
            <Label htmlFor="shared-collection-url">
              Sharing link
            </Label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Input
                id="shared-collection-url"
                readOnly
                value={sharingUrl}
                className="font-mono text-xs"
                onFocus={(event) => {
                  event.currentTarget.select();
                }}
              />

              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                leadingIcon={
                  hasCopied ? (
                    <Check
                      className="h-4 w-4"
                      strokeWidth={1.75}
                    />
                  ) : (
                    <Copy
                      className="h-4 w-4"
                      strokeWidth={1.75}
                    />
                  )
                }
                onClick={() => {
                  void handleCopyLink();
                }}
              >
                {hasCopied
                  ? "Copied"
                  : "Copy link"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                leadingIcon={
                  <ExternalLink
                    className="h-4 w-4"
                    strokeWidth={1.75}
                  />
                }
                onClick={() => {
                  window.open(
                    sharingUrl,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Open
              </Button>
            </div>

            <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">
              Anyone who receives this link can
              forward it. Stop sharing to
              invalidate the current link.
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            className="mt-6 text-sm leading-6 text-[var(--color-reminder-overdue)]"
          >
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p
            role="status"
            className="mt-6 text-sm leading-6 text-[var(--color-text-secondary)]"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-7 border-t border-[var(--color-border)] pt-6">
          {!sharingState?.enabled ? (
            <Button
              type="button"
              disabled={isSaving}
              leadingIcon={
                <Link2
                  className="h-4 w-4"
                  strokeWidth={1.75}
                />
              }
              onClick={() => {
                void handleEnableSharing();
              }}
            >
              {isSaving
                ? "Creating link…"
                : "Create sharing link"}
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={
                  isSaving ||
                  !hasMetadataChanges
                }
                onClick={() => {
                  void handleSaveMetadata();
                }}
              >
                {isSaving
                  ? "Saving…"
                  : "Save public details"}
              </Button>

              {!isConfirmingRevoke ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => {
                    setIsConfirmingRevoke(
                      true,
                    );
                    setMessage(null);
                  }}
                >
                  Stop sharing
                </Button>
              ) : null}
            </div>
          )}

          {sharingState?.enabled &&
          isConfirmingRevoke ? (
            <div className="mt-5 max-w-2xl border-l-2 border-[var(--color-border-strong)] pl-4">
              <p className="text-sm leading-6 text-[var(--color-text-primary)]">
                Stop sharing this collection?
              </p>

              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                The current link will stop
                working immediately. Sharing
                again later will create a new
                link.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={() => {
                    void handleRevokeSharing();
                  }}
                >
                  {isSaving
                    ? "Stopping sharing…"
                    : "Confirm stop sharing"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => {
                    setIsConfirmingRevoke(
                      false,
                    );
                  }}
                >
                  Keep sharing
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Surface>
  );
}