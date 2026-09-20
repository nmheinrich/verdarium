import {
  useEffect,
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

import { ExpandedSpecimenView } from "@/components/cards";
import { Dashboard } from "@/components/dashboard";
import {
  AddSpecimenForm,
  EditSpecimenForm,
  ExportCollectionForm,
  ImportCollectionForm,
  ThemeSelector,
} from "@/components/forms";
import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import {
  Button,
  ErrorState,
  IconButton,
  Surface,
} from "@/components/ui";
import {
  initializeTheme,
  setTheme,
} from "@/lib";
import { supabase } from "@/lib/supabase";
import type { CollectionStorageError } from "@/storage";
import {
  loadCollection,
} from "@/storage";
import { localCollectionStore } from "@/storage/localCollectionStore";
import { getCloudCollectionStore } from "@/storage/supabase/cloudCollectionStore";
import { synchronizeCollectionWhenSafe } from "@/storage/supabase/migrationActions";
import type {
  Specimen,
  ThemeId,
} from "@/types";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Settings", value: "settings" },
];

type AppView =
  | "collection"
  | "add-specimen"
  | "specimen"
  | "edit-specimen"
  | "settings";

interface CollectionState {
  specimens: Specimen[];
  error: CollectionStorageError | null;
}

function loadCollectionState(): CollectionState {
  const result = loadCollection();

  if (result.success) {
    return {
      specimens: result.data,
      error: null,
    };
  }

  return {
    specimens: [],
    error: result.error,
  };
}

export default function App() {
  const shouldReduceMotion = useReducedMotion();

  const [view, setView] =
    useState<AppView>("collection");

  const [theme, setActiveTheme] =
    useState<ThemeId>(() => initializeTheme());

  const [collectionState, setCollectionState] =
    useState<CollectionState>(() =>
      loadCollectionState(),
    );

  const [selectedSpecimenId, setSelectedSpecimenId] =
    useState<string | null>(null);

  const [
    isDeleteConfirming,
    setIsDeleteConfirming,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(null);

  const [
    cloudError,
    setCloudError,
  ] = useState<string | null>(null);

  const [
    isCloudActive,
    setIsCloudActive,
  ] = useState(false);

  const returnFocusSpecimenIdRef =
    useRef<string | null>(null);

  const selectedSpecimen =
    selectedSpecimenId === null
      ? null
      : collectionState.specimens.find(
          (specimen) =>
            specimen.id === selectedSpecimenId,
        ) ?? null;

  const activeNavigationItem =
    view === "settings"
      ? "settings"
      : "collection";

  const specimenCount =
    collectionState.specimens.length;

  useEffect(() => {
    let isCancelled = false;

    async function initializeCloudCollection() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (isCancelled) {
        return;
      }

      if (error) {
        setCloudError(
          "Verdarium could not check cloud availability. Your local botanical archive remains available.",
        );
        return;
      }

      if (!session) {
        setIsCloudActive(false);
        return;
      }

      const syncResult =
        await synchronizeCollectionWhenSafe();

      if (isCancelled) {
        return;
      }

      if (!syncResult.success) {
        setIsCloudActive(false);

        if (syncResult.error.code === "sync-conflict") {
          setCloudError(
            "The local and cloud collections contain different records. Verdarium has left both archives unchanged until you choose how to resolve them.",
          );
          return;
        }

        setCloudError(
          "Verdarium could not synchronize the cloud collection. Your local botanical archive remains unchanged.",
        );
        return;
      }

      setCollectionState({
        specimens: syncResult.data,
        error: null,
      });

      setCloudError(null);
      setIsCloudActive(true);
    }

    void initializeCloudCollection();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isDeleteConfirming) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      document
        .getElementById(
          "delete-specimen-confirmation-heading",
        )
        ?.focus();
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isDeleteConfirming]);

  const mirrorCollectionToCloud = async (
    specimens: Specimen[],
  ): Promise<Specimen[]> => {
    if (!isCloudActive) {
      return specimens;
    }

    const storeResult =
      await getCloudCollectionStore();

    if (!storeResult.success) {
      setCloudError(
        "Verdarium saved this change locally but could not reach the cloud collection. The cloud archive has not been overwritten.",
      );

      return specimens;
    }

    const replaceResult =
      await storeResult.store.replaceCollection(specimens);

    if (!replaceResult.success) {
      setCloudError(
        "Verdarium saved this change locally but could not synchronize it to the cloud. The cloud archive has not been overwritten.",
      );

      return specimens;
    }

    setCloudError(null);

    return replaceResult.data;
  };

  const handleSpecimenCreated = async (
    specimens: Specimen[],
  ) => {
    const synchronizedSpecimens =
      await mirrorCollectionToCloud(specimens);

    setCollectionState({
      specimens: synchronizedSpecimens,
      error: null,
    });

    setView("collection");
  };

  const handleSpecimenUpdated = async (
    specimens: Specimen[],
  ) => {
    const synchronizedSpecimens =
      await mirrorCollectionToCloud(specimens);

    setCollectionState({
      specimens: synchronizedSpecimens,
      error: null,
    });

    setView("specimen");
  };

  const handleCollectionImported = async (
    specimens: Specimen[],
  ) => {
    const synchronizedSpecimens =
      await mirrorCollectionToCloud(specimens);

    setCollectionState({
      specimens: synchronizedSpecimens,
      error: null,
    });

    setSelectedSpecimenId(null);
    setIsDeleteConfirming(false);
    setDeleteError(null);
    returnFocusSpecimenIdRef.current = null;
  };

  const handleAddSpecimen = () => {
    returnFocusSpecimenIdRef.current = null;
    setView("add-specimen");
  };

  const handleCancelAddSpecimen = () => {
    setView("collection");
  };

  const handleSpecimenExitComplete = () => {
    if (
      view === "collection" ||
      view === "settings"
    ) {
      setSelectedSpecimenId(null);
    }
  };

  const handleSelectSpecimen = (
    specimen: Specimen,
  ) => {
    setSelectedSpecimenId(specimen.id);
    setIsDeleteConfirming(false);
    setDeleteError(null);
    returnFocusSpecimenIdRef.current =
      specimen.id;
    setView("specimen");
  };

  const handleReturnToCollection = () => {
    if (selectedSpecimen) {
      returnFocusSpecimenIdRef.current =
        selectedSpecimen.id;
    }

    setIsDeleteConfirming(false);
    setDeleteError(null);
    setView("collection");
  };

  const handleEditSpecimen = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setIsDeleteConfirming(false);
    setDeleteError(null);
    setView("edit-specimen");
  };

  const handleCancelEditSpecimen = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setView("specimen");
  };

  const handleRequestDelete = () => {
    setDeleteError(null);
    setIsDeleteConfirming(true);
  };

  const handleCancelDelete = () => {
    setDeleteError(null);
    setIsDeleteConfirming(false);

    requestAnimationFrame(() => {
      document
        .getElementById("delete-specimen-button")
        ?.focus();
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setDeleteError(null);

    if (isCloudActive) {
      const storeResult =
        await getCloudCollectionStore();

      if (!storeResult.success) {
        setDeleteError(
          "Verdarium could not reach the cloud collection. The botanical record remains unchanged.",
        );
        return;
      }

      const result =
        await storeResult.store.deleteSpecimen(
          selectedSpecimen.id,
        );

      if (!result.success) {
        setDeleteError(
          "Verdarium could not remove this specimen. The botanical record remains in your collection, so you can try again.",
        );
        return;
      }

      const localResult =
        await localCollectionStore.replaceCollection(
          result.data,
        );

      if (!localResult.success) {
        setCloudError(
          "The specimen was removed from the cloud archive, but Verdarium could not refresh the local browser copy.",
        );
      } else {
        setCloudError(null);
      }

      setCollectionState({
        specimens: result.data,
        error: null,
      });
    } else {
      const result =
        await localCollectionStore.deleteSpecimen(
          selectedSpecimen.id,
        );

      if (!result.success) {
        setDeleteError(
          "Verdarium could not remove this specimen. The botanical record remains in your collection, so you can try again.",
        );
        return;
      }

      setCollectionState({
        specimens: result.data,
        error: null,
      });
    }

    returnFocusSpecimenIdRef.current = null;
    setSelectedSpecimenId(null);
    setIsDeleteConfirming(false);
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

    if (value === "settings") {
      returnFocusSpecimenIdRef.current = null;
      setIsDeleteConfirming(false);
      setDeleteError(null);
      setView("settings");
    }
  };

  const handleSpecimenViewAnimationComplete = () => {
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
      ?.focus();
  };

  const handleCollectionViewAnimationComplete = () => {
    if (view !== "collection") {
      return;
    }

    const specimenId =
      returnFocusSpecimenIdRef.current;

    if (!specimenId) {
      return;
    }

    const specimenButton = document.getElementById(
      `compact-specimen-${specimenId}-open`,
    );

    if (specimenButton) {
      specimenButton.focus();
      returnFocusSpecimenIdRef.current = null;
    }
  };

  if (
    (view === "specimen" ||
      view === "edit-specimen") &&
    !selectedSpecimen
  ) {
    return (
      <AppShell
        navigation={
          <AppNav
            items={navigationItems}
            activeItem="collection"
            onNavigate={handleNavigation}
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
            description="Verdarium could not locate the selected specimen in the current collection. It may have been removed or replaced by a recently imported archive."
            actions={
              <Button
                variant="secondary"
                leadingIcon={
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={handleReturnToCollection}
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
    <AppShell
      navigation={
        <AppNav
          items={navigationItems}
          activeItem={activeNavigationItem}
          onNavigate={handleNavigation}
        />
      }
    >
      <AnimatePresence
        initial={false}
        mode="wait"
        onExitComplete={handleSpecimenExitComplete}
      >
        {view === "collection" ? (
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
              duration: shouldReduceMotion
                ? 0.1
                : 0.22,
              ease: shouldReduceMotion
                ? "easeOut"
                : [0.22, 1, 0.36, 1],
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
                collectionState.specimens.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleAddSpecimen}
                    className="group inline-flex items-center gap-2 font-serif text-xl text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 sm:text-2xl"
                  >
                    <Plus
                      size={18}
                      aria-hidden="true"
                      className="text-[var(--color-text-muted)]"
                    />

                    <span className="underline-offset-4 group-hover:underline group-focus-visible:underline">
                      Add specimen
                    </span>
                  </button>
                ) : null
              }
            />

            {cloudError ? (
              <Surface
                variant="subtle"
                className="mt-6 px-4 py-4 sm:px-5"
              >
                <p
                  role="alert"
                  className="text-sm leading-6 text-[var(--color-text-secondary)]"
                >
                  {cloudError}
                </p>
              </Surface>
            ) : null}

            <Dashboard
              specimens={collectionState.specimens}
              loadError={collectionState.error}
              onSpecimenSelect={handleSelectSpecimen}
              onAddSpecimen={handleAddSpecimen}
            />
          </motion.div>
        ) : null}

        {view === "specimen" && selectedSpecimen ? (
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
              duration: shouldReduceMotion
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
              title={selectedSpecimen.commonName}
              description={selectedSpecimen.scientificName}
              actions={
                <Button
                  variant="secondary"
                  leadingIcon={
                    <ArrowLeft
                      size={16}
                      aria-hidden="true"
                    />
                  }
                  onClick={handleReturnToCollection}
                >
                  Back to collection
                </Button>
              }
            />

            <div className="mt-8">
              <AnimatePresence initial={false}>
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
                      duration: shouldReduceMotion
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
                            Permanent removal
                          </p>

                          <h2
                            id="delete-specimen-confirmation-heading"
                            tabIndex={-1}
                            className="mt-1.5 font-serif text-xl leading-tight text-[var(--color-text-primary)]"
                          >
                            Remove this specimen?
                          </h2>

                          <p className="mt-1.5 text-xs leading-5 text-[var(--color-text-secondary)] sm:text-sm">
                            This botanical record will be permanently deleted.
                          </p>

                          {deleteError ? (
                            <p
                              role="alert"
                              className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]"
                            >
                              {deleteError}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <IconButton
                            variant="default"
                            size="compact"
                            aria-label="Cancel specimen deletion"
                            icon={<X size={16} />}
                            onClick={handleCancelDelete}
                          />

                          <IconButton
                            variant="default"
                            size="compact"
                            aria-label="Confirm specimen deletion"
                            icon={<Check size={16} />}
                            className="border-[var(--color-reminder-overdue)] bg-[var(--color-reminder-overdue)] text-[var(--color-text-primary)] hover:brightness-95 active:brightness-90"
                            onClick={handleConfirmDelete}
                          />
                        </div>
                      </div>
                    </Surface>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <ExpandedSpecimenView
                specimen={selectedSpecimen}
                actions={
                  <>
                    <Button
                      size="compact"
                      variant="secondary"
                      leadingIcon={
                        <Pencil
                          size={15}
                          aria-hidden="true"
                        />
                      }
                      onClick={handleEditSpecimen}
                    >
                      Edit specimen
                    </Button>

                    <Button
                      id="delete-specimen-button"
                      size="compact"
                      variant="secondary"
                      leadingIcon={
                        <Trash2
                          size={15}
                          aria-hidden="true"
                        />
                      }
                      className="border-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]"
                      onClick={handleRequestDelete}
                    >
                      Delete specimen
                    </Button>
                  </>
                }
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {view === "add-specimen" ? (
        <>
          <PageHeader
            eyebrow="Specimen Intake"
            title="Add specimen"
            description="Create a new botanical record for your personal herbarium."
            actions={
              <Button
                variant="secondary"
                leadingIcon={
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={handleCancelAddSpecimen}
              >
                Back to collection
              </Button>
            }
          />

          <div className="mt-8">
            <AddSpecimenForm
              onCancel={handleCancelAddSpecimen}
              onCreated={handleSpecimenCreated}
            />
          </div>
        </>
      ) : null}

      {view === "edit-specimen" &&
      selectedSpecimen ? (
        <>
          <PageHeader
            eyebrow="Specimen Revision"
            title={`Edit ${selectedSpecimen.commonName}`}
            description="Revise the botanical record while preserving its archive history."
            actions={
              <Button
                variant="secondary"
                leadingIcon={
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={handleCancelEditSpecimen}
              >
                Back to specimen
              </Button>
            }
          />

          <div className="mt-8">
            <EditSpecimenForm
              specimen={selectedSpecimen}
              onCancel={handleCancelEditSpecimen}
              onUpdated={handleSpecimenUpdated}
            />
          </div>
        </>
      ) : null}

      {view === "settings" ? (
        <>
          <PageHeader
            eyebrow="Archive Preferences"
            title="Settings"
            description="Adjust the appearance of Verdarium and manage your botanical archive."
          />

          <div className="mt-8 max-w-3xl space-y-6">
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
                    className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
                  >
                    Appearance
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Choose the visual atmosphere used
                    throughout your botanical archive.
                  </p>
                </div>

                <div className="mt-7 border-t border-[var(--color-border)] pt-6">
                  <ThemeSelector
                    value={theme}
                    onChange={handleThemeChange}
                  />
                </div>
              </section>
            </Surface>

            <Surface className="p-6 sm:p-8">
              <section
                aria-labelledby="settings-collection-heading"
              >
                <div className="max-w-2xl">
                  <p className="metadata-label">
                    Archive stewardship
                  </p>

                  <h2
                    id="settings-collection-heading"
                    className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
                  >
                    Collection management
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Create a portable backup of your
                    collection or restore Verdarium from
                    a previously exported archive.
                  </p>
                </div>

                <div className="mt-7 border-t border-[var(--color-border)] pt-6">
                  <ExportCollectionForm
                    specimens={collectionState.specimens}
                  />
                </div>

                <div className="mt-8 border-t border-[var(--color-border)] pt-8">
                  <ImportCollectionForm
                    onImported={handleCollectionImported}
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
                    Archive storage
                  </p>

                  <h2
                    id="settings-archive-heading"
                    className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
                  >
                    Archive information
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {isCloudActive
                      ? "Verdarium is connected to your private cloud collection while retaining a local browser copy."
                      : "Verdarium currently keeps your botanical collection locally in this browser. Export the archive periodically if you want a portable backup."}
                  </p>
                </div>

                <dl className="mt-7 grid gap-6 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
                  <div>
                    <dt className="metadata-label">
                      Specimens
                    </dt>

                    <dd className="mt-2 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
                      {specimenCount}
                    </dd>
                  </div>

                  <div>
                    <dt className="metadata-label">
                      Storage
                    </dt>

                    <dd className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {isCloudActive
                        ? "Private cloud + this browser"
                        : "This browser"}
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 border-t border-[var(--color-border)] pt-6 text-xs leading-5 text-[var(--color-text-muted)]">
                  {isCloudActive
                    ? "Cloud synchronization is active for this signed-in session. Multi-device conflict resolution will be expanded in a later Verdarium feature."
                    : "Collection data is not automatically synchronized between browsers or devices."}
                </p>

                {cloudError ? (
                  <p
                    role="alert"
                    className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
                  >
                    {cloudError}
                  </p>
                ) : null}
              </section>
            </Surface>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}