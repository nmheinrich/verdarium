import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  initializeAuthenticatedCollection,
  resolveCollectionConflict,
  type CollectionConflictChoice,
} from "@/auth/collectionSessionCoordinator";
import { useAuth } from "@/auth/useAuth";
import {
  AccountMenu,
  type ArchiveConnectionStatus,
} from "@/components/auth/AccountMenu";
import { ArchiveEntry } from "@/components/auth/ArchiveEntry";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { CollectionConflictDialog } from "@/components/auth/CollectionConflictDialog";
import { ExpandedSpecimenView } from "@/components/cards";
import {
  CareHistory,
  CareReminderForm,
  DueNextView,
  SpecimenCarePanel,
} from "@/components/care";
import { Dashboard } from "@/components/dashboard";
import {
  AddSpecimenForm,
  EditSpecimenForm,
  ExportCollectionForm,
  ImportCollectionForm,
  ThemeSelector,
  type CollectionImportOutcome,
} from "@/components/forms";
import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import {
  CollectionSharingSettings,
  SharedCollectionView,
} from "@/components/sharing";
import {
  Button,
  ErrorState,
  IconButton,
  Surface,
} from "@/components/ui";
import {
  initializeTheme,
  isSpecimenCareDue,
  setTheme,
} from "@/lib";
import { useLocalDateRollover } from "@/care/useLocalDateRollover";
import {
  TileCareContext,
  useTileCare,
} from "@/care/useTileCare";
import { loadSharedCollection } from "@/sharing/sharingService";
import type { SharedCollection } from "@/sharing/types";
import { getCloudCollectionStore } from "@/storage/supabase/cloudCollectionStore";
import type {
  Specimen,
  SpecimenReminder,
  ThemeId,
} from "@/types";

const navigationItems = [
  {
    label: "Collection",
    value: "collection",
  },
  {
    label: "Due next",
    value: "due-next",
  },
  {
    label: "Settings",
    value: "settings",
  },
];

type AppView =
  | "collection"
  | "due-next"
  | "add-specimen"
  | "specimen"
  | "edit-specimen"
  | "settings";

type SpecimenMutationOutcome =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function getSharedRouteToken(): string | null {
  const match = window.location.pathname.match(
    /^\/shared\/([^/]+)\/?$/,
  );

  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function App() {
  const shouldReduceMotion = useReducedMotion();

  const {
    state: authState,
    signOut,
  } = useAuth();

  const sharedRouteToken =
    getSharedRouteToken();

  const [
    sharedCollection,
    setSharedCollection,
  ] =
    useState<SharedCollection | null>(
      null,
    );

  const [
    isSharedCollectionLoading,
    setIsSharedCollectionLoading,
  ] = useState(
    sharedRouteToken !== null,
  );

  const [
    sharedCollectionError,
    setSharedCollectionError,
  ] =
    useState<string | null>(
      null,
    );

  const [view, setView] =
    useState<AppView>("collection");

  const [
    theme,
    setActiveTheme,
  ] = useState<ThemeId>(
    () => initializeTheme(),
  );

  const [
    specimens,
    setSpecimens,
  ] = useState<Specimen[]>([]);

  const [
    careHistoryRefreshTokens,
    setCareHistoryRefreshTokens,
  ] = useState<Record<string, number>>({});

  const [
    selectedSpecimenId,
    setSelectedSpecimenId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isDeleteConfirming,
    setIsDeleteConfirming,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    archiveStatus,
    setArchiveStatus,
  ] =
    useState<ArchiveConnectionStatus>(
      "connecting",
    );

  const [
    archiveWarning,
    setArchiveWarning,
  ] =
    useState<string | null>(
      null,
    );

  const [
    cloudError,
    setCloudError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isAuthDialogOpen,
    setIsAuthDialogOpen,
  ] = useState(false);

  const [
    isConflictDialogOpen,
    setIsConflictDialogOpen,
  ] = useState(false);

  const [
    isResolvingConflict,
    setIsResolvingConflict,
  ] = useState(false);

  const [
    conflictError,
    setConflictError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false);

  const [
    connectionAttempt,
    setConnectionAttempt,
  ] = useState(0);

  const returnFocusSpecimenIdRef =
    useRef<string | null>(null);

  // Each view starts at the top, except returning to the collection from a
  // specimen, where focus (and scroll) goes back to that specimen's tile.
  useEffect(() => {
    if (
      view === "collection" &&
      returnFocusSpecimenIdRef.current
    ) {
      return;
    }

    window.scrollTo({ top: 0 });
  }, [view]);

  const careRolloverToken = useLocalDateRollover();

  const careDueCount = useMemo(
    () => {
      void careRolloverToken;

      return specimens.filter((specimen) =>
        isSpecimenCareDue(specimen),
      ).length;
    },
    [specimens, careRolloverToken],
  );

  const primaryNavigationItems = navigationItems.map(
    (item) =>
      item.value === "due-next"
        ? { ...item, count: careDueCount }
        : item,
  );

  const activeUserIdRef =
    useRef<string | null>(null);

  const authenticatedUserId =
    authState.status === "signedIn"
      ? authState.user.id
      : null;

  const selectedSpecimen =
    selectedSpecimenId === null
      ? null
      : specimens.find(
          (specimen) =>
            specimen.id ===
            selectedSpecimenId,
        ) ?? null;

  const activeNavigationItem =
    view === "settings"
      ? "settings"
      : view === "due-next"
        ? "due-next"
        : "collection";

  const isCollectionReady =
    archiveStatus === "cloud";

  useEffect(() => {
    if (!sharedRouteToken) {
      return;
    }

    const shareToken =
      sharedRouteToken;

    let isCancelled = false;

    async function openSharedCollection() {
      setIsSharedCollectionLoading(
        true,
      );

      setSharedCollection(null);
      setSharedCollectionError(null);

      const result =
        await loadSharedCollection(
          shareToken,
        );

      if (isCancelled) {
        return;
      }

      if (!result.success) {
        setSharedCollectionError(
          result.error.message,
        );

        setIsSharedCollectionLoading(
          false,
        );

        return;
      }

      setSharedCollection(
        result.data,
      );

      setSharedCollectionError(null);

      setIsSharedCollectionLoading(
        false,
      );
    }

    void openSharedCollection();

    return () => {
      isCancelled = true;
    };
  }, [sharedRouteToken]);

  useEffect(() => {
    let isCancelled = false;

    async function initializeCollection() {
      await Promise.resolve();

      if (
        isCancelled ||
        sharedRouteToken
      ) {
        return;
      }

      if (
        authState.status !== "signedIn" ||
        !authenticatedUserId
      ) {
        activeUserIdRef.current = null;

        setSpecimens([]);
        setSelectedSpecimenId(null);
        setArchiveStatus(
          "connecting",
        );
        setArchiveWarning(null);
        setCloudError(null);
        setIsConflictDialogOpen(
          false,
        );
        setConflictError(null);
        setView("collection");

        return;
      }

      activeUserIdRef.current =
        authenticatedUserId;

      setSpecimens([]);
      setSelectedSpecimenId(null);
      setArchiveStatus(
        "connecting",
      );
      setArchiveWarning(null);
      setCloudError(null);
      setConflictError(null);

      const outcome =
        await initializeAuthenticatedCollection();

      if (
        isCancelled ||
        activeUserIdRef.current !==
          authenticatedUserId
      ) {
        return;
      }

      if (
        outcome.status ===
        "conflict"
      ) {
        setArchiveStatus(
          "conflict",
        );
        setCloudError(
          outcome.message,
        );
        setIsConflictDialogOpen(
          true,
        );

        return;
      }

      if (
        outcome.status === "error"
      ) {
        setArchiveStatus("error");
        setCloudError(
          outcome.message,
        );

        return;
      }

      setSpecimens(
        outcome.specimens,
      );

      setArchiveStatus("cloud");
      setArchiveWarning(
        outcome.warning,
      );
      setCloudError(null);
    }

    void initializeCollection();

    return () => {
      isCancelled = true;
    };
  }, [
    authState.status,
    authenticatedUserId,
    connectionAttempt,
    sharedRouteToken,
  ]);

  useEffect(() => {
    if (!isDeleteConfirming) {
      return;
    }

    const animationFrame =
      requestAnimationFrame(() => {
        document
          .getElementById(
            "delete-specimen-confirmation-heading",
          )
          ?.focus();
      });

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [isDeleteConfirming]);

  const handleCreateSpecimen =
    async (
      specimen: Specimen,
    ): Promise<SpecimenMutationOutcome> => {
      if (!isCollectionReady) {
        return {
          success: false,
          message:
            "The private archive is not ready. Please wait or try opening it again.",
        };
      }

      const storeResult =
        await getCloudCollectionStore();

      if (!storeResult.success) {
        return {
          success: false,
          message:
            "Verdarium could not reach the private archive. Your entered information has been preserved.",
        };
      }

      const result =
        await storeResult.store.addSpecimen(
          specimen,
        );

      if (!result.success) {
        return {
          success: false,
          message:
            "Verdarium could not save this specimen to the private archive. Your entered information has been preserved.",
        };
      }

      setSpecimens(result.data);
      setSelectedSpecimenId(null);
      setCloudError(null);
      setView("collection");

      return {
        success: true,
      };
    };

  const handleUpdateSpecimen =
    async (
      specimen: Specimen,
    ): Promise<SpecimenMutationOutcome> => {
      if (!isCollectionReady) {
        return {
          success: false,
          message:
            "The private archive is not ready. Please wait or try opening it again.",
        };
      }

      const storeResult =
        await getCloudCollectionStore();

      if (!storeResult.success) {
        return {
          success: false,
          message:
            "Verdarium could not reach the private archive. Your edits have been preserved.",
        };
      }

      const result =
        await storeResult.store.updateSpecimen(
          specimen,
        );

      if (!result.success) {
        return {
          success: false,
          message:
            "Verdarium could not save these changes to the private archive. Your edits have been preserved.",
        };
      }

      setSpecimens(result.data);
      setSelectedSpecimenId(
        specimen.id,
      );
      setCloudError(null);
      setView("specimen");

      return {
        success: true,
      };
    };

  const handleReminderChange = (
    specimenId: string,
    reminder: SpecimenReminder,
  ) => {
    setSpecimens(
      (currentSpecimens) =>
        currentSpecimens.map(
          (specimen) =>
            specimen.id ===
            specimenId
              ? {
                  ...specimen,
                  reminder,
                }
              : specimen,
        ),
    );

    setCareHistoryRefreshTokens(
      (currentTokens) => ({
        ...currentTokens,
        [specimenId]:
          (currentTokens[specimenId] ?? 0) + 1,
      }),
    );
  };

  const tileCare =
    useTileCare(handleReminderChange);

  const handleImportCollection =
    async (
      importedSpecimens: Specimen[],
    ): Promise<CollectionImportOutcome> => {
      if (!isCollectionReady) {
        return {
          success: false,
          message:
            "The private archive is not ready. Please wait or try opening it again.",
        };
      }

      // Care recorded in the last few seconds belongs to the old records.
      await tileCare.flushAll();

      const storeResult =
        await getCloudCollectionStore();

      if (!storeResult.success) {
        return {
          success: false,
          message:
            "Verdarium could not reach the private archive. Your current collection has not been changed.",
        };
      }

      const result =
        await storeResult.store.replaceCollection(
          importedSpecimens,
        );

      if (!result.success) {
        return {
          success: false,
          message:
            "Verdarium could not import this archive. Your current collection has not been changed.",
        };
      }

      setSpecimens(result.data);
      setCareHistoryRefreshTokens({});
      setCloudError(null);

      return {
        success: true,
        specimens: result.data,
      };
    };

  const handleAddSpecimen = () => {
    if (!isCollectionReady) {
      return;
    }

    returnFocusSpecimenIdRef.current =
      null;

    setView("add-specimen");
  };

  const handleCancelAddSpecimen =
    () => {
      setView("collection");
    };

  const handleSpecimenExitComplete =
    () => {
      if (
        view === "collection" ||
        view === "due-next" ||
        view === "settings"
      ) {
        setSelectedSpecimenId(
          null,
        );
      }
    };

  const handleSelectSpecimen = (
    specimen: Specimen,
  ) => {
    setSelectedSpecimenId(
      specimen.id,
    );

    setIsDeleteConfirming(
      false,
    );

    setDeleteError(null);

    returnFocusSpecimenIdRef.current =
      specimen.id;

    setView("specimen");
  };

  const handleReturnToCollection =
    () => {
      if (selectedSpecimen) {
        returnFocusSpecimenIdRef.current =
          selectedSpecimen.id;
      }

      setIsDeleteConfirming(
        false,
      );

      setDeleteError(null);

      setView("collection");
    };

  const handleEditSpecimen = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setIsDeleteConfirming(
      false,
    );

    setDeleteError(null);

    setView("edit-specimen");
  };

  const handleCancelEditSpecimen =
    () => {
      if (!selectedSpecimen) {
        handleReturnToCollection();
        return;
      }

      setView("specimen");
    };

  const handleRequestDelete =
    () => {
      setDeleteError(null);

      setIsDeleteConfirming(
        true,
      );
    };

  const handleCancelDelete = () => {
    setDeleteError(null);

    setIsDeleteConfirming(
      false,
    );

    requestAnimationFrame(() => {
      document
        .getElementById(
          "delete-specimen-button",
        )
        ?.focus();
    });
  };

  const handleConfirmDelete =
    async () => {
      if (!selectedSpecimen) {
        handleReturnToCollection();
        return;
      }

      if (!isCollectionReady) {
        setDeleteError(
          "The private archive is not ready. This specimen remains unchanged.",
        );

        return;
      }

      setDeleteError(null);

      const storeResult =
        await getCloudCollectionStore();

      if (!storeResult.success) {
        setDeleteError(
          "Verdarium could not reach the private archive. This specimen remains unchanged.",
        );

        return;
      }

      const result =
        await storeResult.store.deleteSpecimen(
          selectedSpecimen.id,
        );

      if (!result.success) {
        setDeleteError(
          "Verdarium could not remove this specimen. The botanical record remains in your collection.",
        );

        return;
      }

      setSpecimens(result.data);
      setSelectedSpecimenId(null);
      setIsDeleteConfirming(
        false,
      );
      setCloudError(null);

      returnFocusSpecimenIdRef.current =
        null;

      setView("collection");
    };

  const handleThemeChange = (
    nextTheme: ThemeId,
  ) => {
    setActiveTheme(nextTheme);
    setTheme(nextTheme);
  };

  const handleNavigation = (
    value: string,
  ) => {
    if (value === "collection") {
      handleReturnToCollection();
      return;
    }

    if (value === "due-next") {
      returnFocusSpecimenIdRef.current =
        null;

      setSelectedSpecimenId(null);
      setIsDeleteConfirming(
        false,
      );
      setDeleteError(null);

      setView("due-next");

      return;
    }

    if (value === "settings") {
      returnFocusSpecimenIdRef.current =
        null;

      setSelectedSpecimenId(null);
      setIsDeleteConfirming(
        false,
      );
      setDeleteError(null);

      setView("settings");
    }
  };

  const handleSpecimenViewAnimationComplete =
    () => {
      if (
        view !== "specimen" ||
        !selectedSpecimen
      ) {
        return;
      }

      document
        .getElementById(
          `expanded-specimen-${selectedSpecimen.id}-name`,
        )
        // The view opens at the top; move focus without jumping past the plate.
        ?.focus({ preventScroll: true });
    };

  const handleCollectionViewAnimationComplete =
    () => {
      if (
        view !== "collection"
      ) {
        return;
      }

      const specimenId =
        returnFocusSpecimenIdRef.current;

      if (!specimenId) {
        return;
      }

      const specimenButton =
        document.getElementById(
          `compact-specimen-${specimenId}-open`,
        );

      if (specimenButton) {
        specimenButton.focus();

        returnFocusSpecimenIdRef.current =
          null;
      }
    };

  const handleResolveConflict =
    async (
      choice: CollectionConflictChoice,
    ) => {
      if (
        isResolvingConflict ||
        !authenticatedUserId
      ) {
        return;
      }

      const resolvingUserId =
        authenticatedUserId;

      setIsResolvingConflict(
        true,
      );

      setConflictError(null);

      const outcome =
        await resolveCollectionConflict(
          choice,
        );

      if (
        activeUserIdRef.current !==
        resolvingUserId
      ) {
        setIsResolvingConflict(
          false,
        );

        return;
      }

      if (
        outcome.status !== "ready"
      ) {
        setConflictError(
          outcome.message,
        );

        setIsResolvingConflict(
          false,
        );

        return;
      }

      setSpecimens(
        outcome.specimens,
      );

      setSelectedSpecimenId(null);
      setArchiveStatus("cloud");
      setArchiveWarning(
        outcome.warning,
      );
      setCloudError(null);
      setConflictError(null);
      setIsResolvingConflict(
        false,
      );
      setIsConflictDialogOpen(
        false,
      );
      setView("collection");
    };

  const handleSignOut =
    async () => {
      if (
        isSigningOut ||
        authState.status !==
          "signedIn"
      ) {
        return;
      }

      setIsSigningOut(true);
      setCloudError(null);

      // Save care recorded in the last few seconds before the session ends.
      await tileCare.flushAll();

      const result =
        await signOut();

      if (!result.success) {
        setCloudError(
          result.error.message,
        );

        setIsSigningOut(false);

        return;
      }

      activeUserIdRef.current =
        null;

      setSpecimens([]);
      setSelectedSpecimenId(null);
      setArchiveWarning(null);
      setCloudError(null);

      setIsConflictDialogOpen(
        false,
      );

      setConflictError(null);
      setIsSigningOut(false);
      setView("collection");
    };

  if (sharedRouteToken) {
    if (
      isSharedCollectionLoading
    ) {
      return (
        <AppShell navigation={null}>
          <Surface
            variant="subtle"
            className="mx-auto max-w-3xl p-8 sm:p-10"
          >
            <p
              role="status"
              className="metadata-label"
            >
              Opening shared archive
            </p>

            <h1 className="mt-3 font-display type-headline text-[var(--color-text-primary)]">
              Retrieving botanical
              collection
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Verdarium is opening
              the read-only botanical
              record associated with
              this sharing link.
            </p>
          </Surface>
        </AppShell>
      );
    }

    if (
      sharedCollectionError ||
      !sharedCollection
    ) {
      return (
        <AppShell navigation={null}>
          <div className="mx-auto max-w-3xl">
            <ErrorState
              eyebrow="Shared archive"
              title="Botanical archive unavailable"
              description={
                sharedCollectionError ??
                "This shared collection is unavailable or is no longer being shared."
              }
            />
          </div>
        </AppShell>
      );
    }

    return (
      <AppShell navigation={null}>
        <SharedCollectionView
          collection={
            sharedCollection
          }
        />
      </AppShell>
    );
  }

  if (
    authState.status !==
    "signedIn"
  ) {
    return (
      <>
        <AppShell navigation={null}>
          <ArchiveEntry
            onOpenAuth={() => {
              setIsAuthDialogOpen(
                true,
              );
            }}
          />
        </AppShell>

        <AuthDialog
          isOpen={
            isAuthDialogOpen
          }
          onClose={() => {
            setIsAuthDialogOpen(
              false,
            );
          }}
        />
      </>
    );
  }

  if (
    (
      view === "specimen" ||
      view === "edit-specimen"
    ) &&
    !selectedSpecimen
  ) {
    return (
      <AppShell
        navigation={
          <AppNav
            items={
              primaryNavigationItems
            }
            activeItem="collection"
            onNavigate={
              handleNavigation
            }
          />
        }
      >
        <PageHeader
          eyebrow="Personal Herbarium"
          title="Collection"
          description="A quiet archive for documenting, studying, and caring for your botanical specimens."
        />

        <div className="mt-8">
          <ErrorState
            eyebrow="Record unavailable"
            title="This botanical record is no longer available"
            description="Verdarium could not locate the selected specimen in the private collection."
            actions={
              <Button
                variant="secondary"
                leadingIcon={
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={
                  handleReturnToCollection
                }
              >
                Back to collection
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  return (
    <TileCareContext.Provider
      value={tileCare}
    >
      <AppShell
        navigation={
          <AppNav
            items={primaryNavigationItems}
            activeItem={
              activeNavigationItem
            }
            onNavigate={
              handleNavigation
            }
          />
        }
      >
        <AnimatePresence
          initial={false}
          mode="wait"
          onExitComplete={
            handleSpecimenExitComplete
          }
        >
          {view ===
          "collection" ? (
            <motion.div
              key="collection"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: -6,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={
                shouldReduceMotion
                  ? {
                      opacity: 0,
                    }
                  : {
                      opacity: 0,
                      y: -8,
                    }
              }
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.1
                    : 0.22,
                ease: shouldReduceMotion
                  ? "easeOut"
                  : [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
              }}
              onAnimationComplete={
                handleCollectionViewAnimationComplete
              }
            >
              <PageHeader
                eyebrow="Personal Herbarium"
                title="Collection"
                description="A quiet archive for documenting, studying, and caring for your botanical specimens."
                actions={
                  isCollectionReady &&
                  specimens.length >
                    0 ? (
                    <Button
                      onClick={
                        handleAddSpecimen
                      }
                      leadingIcon={
                        <Plus strokeWidth={1.75} />
                      }
                    >
                      Add specimen
                    </Button>
                  ) : null
                }
              />

              {archiveWarning ? (
                <Surface
                  variant="subtle"
                  className="mt-6 px-4 py-4 sm:px-5"
                >
                  <p
                    role="status"
                    className="text-sm leading-6 text-[var(--color-text-secondary)]"
                  >
                    {
                      archiveWarning
                    }
                  </p>
                </Surface>
              ) : null}

              {archiveStatus ===
              "connecting" ? (
                <Surface
                  variant="subtle"
                  className="mt-8 p-8"
                >
                  <p
                    role="status"
                    className="metadata-label"
                  >
                    Opening private
                    archive
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Verdarium is
                    retrieving your
                    botanical
                    collection.
                  </p>
                </Surface>
              ) : null}

              {archiveStatus ===
              "error" ? (
                <div className="mt-8">
                  <ErrorState
                    eyebrow="Private archive unavailable"
                    title="Verdarium could not open the collection"
                    description={
                      cloudError ??
                      "The private cloud archive is temporarily unavailable. No records have been changed."
                    }
                    actions={
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setConnectionAttempt(
                            (
                              attempt,
                            ) =>
                              attempt +
                              1,
                          );
                        }}
                      >
                        Try again
                      </Button>
                    }
                  />
                </div>
              ) : null}

              {archiveStatus ===
              "conflict" ? (
                <div className="mt-8">
                  <ErrorState
                    eyebrow="Legacy migration"
                    title="Choose the collection to preserve"
                    description={
                      cloudError ??
                      "A legacy browser collection differs from the private cloud archive."
                    }
                    actions={
                      <Button
                        type="button"
                        onClick={() => {
                          setConflictError(
                            null,
                          );
                          setIsConflictDialogOpen(
                            true,
                          );
                        }}
                      >
                        Review collections
                      </Button>
                    }
                  />
                </div>
              ) : null}

              {isCollectionReady ? (
                <Dashboard
                  specimens={
                    specimens
                  }
                  loadError={null}
                  onSpecimenSelect={
                    handleSelectSpecimen
                  }
                  onAddSpecimen={
                    handleAddSpecimen
                  }
                />
              ) : null}
            </motion.div>
          ) : null}

          {view === "due-next" ? (
            <motion.div
              key="due-next"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 6,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.1
                    : 0.22,
                ease: "easeOut",
              }}
            >
              <PageHeader
                eyebrow="Care register"
                title="Due next"
                description="The care schedule across your collection, in order of the next date."
              />

              {isCollectionReady ? (
                <DueNextView
                  specimens={
                    specimens
                  }
                  onOpenSpecimen={
                    handleSelectSpecimen
                  }
                  onBrowseCollection={() => {
                    setView(
                      "collection",
                    );
                  }}
                />
              ) : (
                <Surface
                  variant="subtle"
                  className="mt-8 p-8"
                >
                  <p
                    role="status"
                    className="metadata-label"
                  >
                    Opening care
                    archive
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Verdarium is
                    retrieving the
                    care rhythms
                    preserved with
                    your botanical
                    collection.
                  </p>
                </Surface>
              )}
            </motion.div>
          ) : null}

          {view ===
            "specimen" &&
          selectedSpecimen ? (
            <motion.div
              key={`specimen-${selectedSpecimen.id}`}
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                    }
              }
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration:
                  shouldReduceMotion
                    ? 0.1
                    : 0.24,
                ease: "easeOut",
              }}
              onAnimationComplete={
                handleSpecimenViewAnimationComplete
              }
            >
              <PageHeader
                eyebrow="Specimen Record"
                title={
                  selectedSpecimen.commonName
                }
                description={
                  selectedSpecimen.scientificName
                }
                actions={
                  <Button
                    variant="secondary"
                    leadingIcon={
                      <ArrowLeft
                        size={16}
                        aria-hidden="true"
                      />
                    }
                    onClick={
                      handleReturnToCollection
                    }
                  >
                    Back to collection
                  </Button>
                }
              />

              <div className="mt-8">
                <AnimatePresence
                  initial={false}
                >
                  {isDeleteConfirming ? (
                    <motion.div
                      key="delete-confirmation"
                      initial={
                        shouldReduceMotion
                          ? false
                          : {
                              opacity: 0,
                              y: -4,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: shouldReduceMotion
                          ? 0
                          : -4,
                      }}
                      transition={{
                        duration:
                          shouldReduceMotion
                            ? 0.1
                            : 0.18,
                        ease: "easeOut",
                      }}
                    >
                      <Surface
                        variant="subtle"
                        className="mb-5 px-4 py-4 sm:px-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="metadata-label">
                              Permanent
                              removal
                            </p>

                            <h2
                              id="delete-specimen-confirmation-heading"
                              tabIndex={
                                -1
                              }
                              className="mt-1.5 font-display type-subtitle text-[var(--color-text-primary)]"
                            >
                              Remove this
                              specimen?
                            </h2>

                            <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)] sm:text-sm">
                              This
                              botanical
                              record will
                              be
                              permanently
                              deleted from
                              the private
                              archive.
                            </p>

                            {deleteError ? (
                              <p
                                role="alert"
                                className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]"
                              >
                                {
                                  deleteError
                                }
                              </p>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <IconButton
                              variant="default"
                              size="compact"
                              aria-label="Cancel specimen deletion"
                              icon={
                                <X
                                  size={
                                    16
                                  }
                                />
                              }
                              onClick={
                                handleCancelDelete
                              }
                            />

                            <IconButton
                              variant="default"
                              size="compact"
                              aria-label="Confirm specimen deletion"
                              icon={
                                <Check
                                  size={
                                    16
                                  }
                                />
                              }
                              className="border-[var(--color-reminder-overdue)] bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)] hover:brightness-95 active:brightness-90"
                              onClick={
                                handleConfirmDelete
                              }
                            />
                          </div>
                        </div>
                      </Surface>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <ExpandedSpecimenView
                  specimen={
                    selectedSpecimen
                  }
                  actions={
                    <>
                      <Button
                        size="compact"
                        variant="secondary"
                        leadingIcon={
                          <Pencil
                            size={
                              15
                            }
                            aria-hidden="true"
                          />
                        }
                        onClick={
                          handleEditSpecimen
                        }
                      >
                        Edit specimen
                      </Button>

                      <Button
                        id="delete-specimen-button"
                        size="compact"
                        variant="secondary"
                        leadingIcon={
                          <Trash2
                            size={
                              15
                            }
                            aria-hidden="true"
                          />
                        }
                        className="border-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]"
                        onClick={
                          handleRequestDelete
                        }
                      >
                        Delete specimen
                      </Button>
                    </>
                  }
                />

                <div className="mt-6 space-y-6">
                  <SpecimenCarePanel
                    specimen={
                      selectedSpecimen
                    }
                  />

                  <CareReminderForm
                    specimen={
                      selectedSpecimen
                    }
                    onReminderChange={(
                      reminder,
                    ) => {
                      handleReminderChange(
                        selectedSpecimen.id,
                        reminder,
                      );
                    }}
                  />

                  <CareHistory
                    specimenId={
                      selectedSpecimen.id
                    }
                    refreshToken={
                      careHistoryRefreshTokens[
                        selectedSpecimen.id
                      ] ?? 0
                    }
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {view ===
        "add-specimen" ? (
          <>
            <PageHeader
              eyebrow="Specimen Intake"
              title="Add specimen"
              description="Create a new botanical record in your private collection."
              actions={
                <Button
                  variant="secondary"
                  leadingIcon={
                    <ArrowLeft
                      size={16}
                      aria-hidden="true"
                    />
                  }
                  onClick={
                    handleCancelAddSpecimen
                  }
                >
                  Back to collection
                </Button>
              }
            />

            <div className="mt-8">
              <AddSpecimenForm
                onCancel={
                  handleCancelAddSpecimen
                }
                onCreate={
                  handleCreateSpecimen
                }
              />
            </div>
          </>
        ) : null}

        {view ===
          "edit-specimen" &&
        selectedSpecimen ? (
          <>
            <PageHeader
              eyebrow="Specimen Revision"
              title={`Edit ${selectedSpecimen.commonName}`}
              description="Revise the botanical record in your private archive."
              actions={
                <Button
                  variant="secondary"
                  leadingIcon={
                    <ArrowLeft
                      size={16}
                      aria-hidden="true"
                    />
                  }
                  onClick={
                    handleCancelEditSpecimen
                  }
                >
                  Back to specimen
                </Button>
              }
            />

            <div className="mt-8">
              <EditSpecimenForm
                specimen={
                  selectedSpecimen
                }
                onCancel={
                  handleCancelEditSpecimen
                }
                onUpdate={
                  handleUpdateSpecimen
                }
              />
            </div>
          </>
        ) : null}

        {view === "settings" ? (
          <>
            <PageHeader
              eyebrow="Archive Preferences"
              title="Settings"
              description="Adjust the appearance of Verdarium and review your private archive."
            />

            <div className="mt-8 max-w-3xl space-y-6">
              <AccountMenu
                archiveStatus={
                  archiveStatus
                }
                isSigningOut={
                  isSigningOut
                }
                warningMessage={
                  archiveWarning ??
                  (archiveStatus ===
                  "error"
                    ? cloudError
                    : null)
                }
                onReviewConflict={() => {
                  setConflictError(
                    null,
                  );
                  setIsConflictDialogOpen(
                    true,
                  );
                }}
                onSignOut={() => {
                  void handleSignOut();
                }}
              />

              <CollectionSharingSettings />

              {isCollectionReady ? (
                <Surface className="p-6 sm:p-8">
                  <section aria-labelledby="settings-archive-files-heading">
                    <div className="max-w-2xl">
                      <p className="metadata-label">
                        Archive files
                      </p>

                      <h2
                        id="settings-archive-files-heading"
                        className="mt-3 font-display type-title text-[var(--color-text-primary)]"
                      >
                        Export and import
                      </h2>
                    </div>

                    <div className="mt-7 space-y-8 border-t border-[var(--color-border)] pt-6">
                      <ExportCollectionForm
                        specimens={specimens}
                      />

                      <div className="border-t border-[var(--color-border)] pt-6">
                        <ImportCollectionForm
                          onImport={
                            handleImportCollection
                          }
                        />
                      </div>
                    </div>
                  </section>
                </Surface>
              ) : null}

              <Surface className="p-6 sm:p-8">
                <section
                  aria-labelledby="settings-appearance-heading"
                >
                  <div className="max-w-2xl">
                    <p className="metadata-label">
                      Presentation
                    </p>

                    <h2
                      id="settings-appearance-heading"
                      className="mt-3 font-display type-title text-[var(--color-text-primary)]"
                    >
                      Appearance
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Choose the
                      visual
                      atmosphere used
                      throughout your
                      botanical
                      archive.
                    </p>
                  </div>

                  <div className="mt-7 border-t border-[var(--color-border)] pt-6">
                    <ThemeSelector
                      value={theme}
                      onChange={
                        handleThemeChange
                      }
                    />
                  </div>
                </section>
              </Surface>

              <Surface className="p-6 sm:p-8">
                <section
                  aria-labelledby="settings-archive-heading"
                >
                  <div className="max-w-2xl">
                    <p className="metadata-label">
                      Archive record
                    </p>

                    <h2
                      id="settings-archive-heading"
                      className="mt-3 font-display type-title text-[var(--color-text-primary)]"
                    >
                      Collection
                      information
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      Verdarium
                      preserves this
                      botanical
                      collection in
                      your private
                      cloud archive.
                    </p>
                  </div>

                  <dl className="mt-7 grid gap-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
                    <div>
                      <dt className="metadata-label">
                        Specimens
                      </dt>

                      <dd className="mt-2 font-display type-title text-[var(--color-text-primary)]">
                        {
                          specimens.length
                        }
                      </dd>
                    </div>

                    <div>
                      <dt className="metadata-label">
                        Storage
                      </dt>

                      <dd className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Private cloud
                      </dd>
                    </div>
                  </dl>
                </section>
              </Surface>
            </div>
          </>
        ) : null}
      </AppShell>

      <CollectionConflictDialog
        isOpen={
          isConflictDialogOpen
        }
        isResolving={
          isResolvingConflict
        }
        errorMessage={
          conflictError
        }
        onResolve={(choice) => {
          void handleResolveConflict(
            choice,
          );
        }}
        onClose={() => {
          setIsConflictDialogOpen(
            false,
          );

          setConflictError(null);
        }}
      />
    </TileCareContext.Provider>
  );
}