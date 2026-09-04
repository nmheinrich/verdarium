import { useState } from "react";
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
  IconButton,
  Surface,
} from "@/components/ui";
import {
  initializeTheme,
  setTheme,
} from "@/lib";
import type { CollectionStorageError } from "@/storage";
import {
  deleteSpecimen,
  loadCollection,
} from "@/storage";
import type {
  Specimen,
  ThemeId,
} from "@/types";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Reminders", value: "reminders" },
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

  const handleSpecimenCreated = (
    specimens: Specimen[],
  ) => {
    setCollectionState({
      specimens,
      error: null,
    });

    setView("collection");
  };

  const handleSpecimenUpdated = (
    specimens: Specimen[],
  ) => {
    setCollectionState({
      specimens,
      error: null,
    });

    setView("specimen");
  };

  const handleCollectionImported = (
    specimens: Specimen[],
  ) => {
    setCollectionState({
      specimens,
      error: null,
    });

    setSelectedSpecimenId(null);
    setIsDeleteConfirming(false);
    setDeleteError(null);
  };

  const handleCancelAddSpecimen = () => {
    setView("collection");
  };

  const handleSelectSpecimen = (
    specimen: Specimen,
  ) => {
    setSelectedSpecimenId(specimen.id);
    setIsDeleteConfirming(false);
    setDeleteError(null);
    setView("specimen");
  };

  const handleReturnToCollection = () => {
    setSelectedSpecimenId(null);
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
  };

  const handleConfirmDelete = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setDeleteError(null);

    const result = deleteSpecimen(
      selectedSpecimen.id,
    );

    if (!result.success) {
      setDeleteError(result.error.message);
      return;
    }

    setCollectionState({
      specimens: result.data,
      error: null,
    });

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
      setSelectedSpecimenId(null);
      setIsDeleteConfirming(false);
      setDeleteError(null);
      setView("settings");
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
          description="The selected botanical record is no longer available."
          actions={
            <Button
              variant="secondary"
              leadingIcon={<ArrowLeft size={16} />}
              onClick={handleReturnToCollection}
            >
              Back to collection
            </Button>
          }
        />
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
      actions={
        view === "collection" ? (
          <Button
            size="compact"
            leadingIcon={<Plus size={16} />}
            onClick={() =>
              setView("add-specimen")
            }
          >
            Add specimen
          </Button>
        ) : null
      }
    >
      {view === "collection" ? (
        <>
          <PageHeader
            eyebrow="Personal Herbarium"
            title="Collection"
            description="A quiet archive for documenting, studying, and caring for your botanical specimens."
          />

          <Dashboard
            specimens={collectionState.specimens}
            loadError={collectionState.error}
            onSpecimenSelect={handleSelectSpecimen}
          />
        </>
      ) : null}

      {view === "add-specimen" ? (
        <>
          <PageHeader
            eyebrow="Specimen Intake"
            title="Add specimen"
            description="Create a new botanical record for your personal herbarium."
            actions={
              <Button
                variant="secondary"
                leadingIcon={<ArrowLeft size={16} />}
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

      {view === "specimen" && selectedSpecimen ? (
        <>
          <PageHeader
            eyebrow="Specimen Record"
            title={selectedSpecimen.commonName}
            description={selectedSpecimen.scientificName}
            actions={
              <Button
                variant="secondary"
                leadingIcon={<ArrowLeft size={16} />}
                onClick={handleReturnToCollection}
              >
                Back to collection
              </Button>
            }
          />

          <div className="mt-8">
            {isDeleteConfirming ? (
              <Surface
                variant="subtle"
                className="mb-5 px-4 py-4 sm:px-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="metadata-label">
                      Permanent removal
                    </p>

                    <h2 className="mt-1.5 font-serif text-xl leading-tight text-[var(--color-text-primary)]">
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
            ) : null}

            <ExpandedSpecimenView
              specimen={selectedSpecimen}
              actions={
                <>
                  <Button
                    size="compact"
                    variant="secondary"
                    leadingIcon={<Pencil size={15} />}
                    onClick={handleEditSpecimen}
                  >
                    Edit specimen
                  </Button>

                  <Button
                    size="compact"
                    variant="secondary"
                    leadingIcon={<Trash2 size={15} />}
                    className="border-[var(--color-reminder-overdue)] text-[var(--color-text-primary)]"
                    onClick={handleRequestDelete}
                  >
                    Delete specimen
                  </Button>
                </>
              }
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
                leadingIcon={<ArrowLeft size={16} />}
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
            description="Adjust how Verdarium presents and manages your botanical collection."
          />

          <div className="mt-8 max-w-3xl space-y-6">
            <Surface className="p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="metadata-label">
                  Presentation
                </p>

                <h2 className="mt-3 font-serif text-2xl leading-tight text-[var(--color-text-primary)]">
                  Archive appearance
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Choose the visual atmosphere used throughout your botanical
                  archive.
                </p>
              </div>

              <div className="mt-7 border-t border-[var(--color-border)] pt-6">
                <ThemeSelector
                  value={theme}
                  onChange={handleThemeChange}
                />
              </div>
            </Surface>

            <Surface className="p-6 sm:p-8">
              <ExportCollectionForm
                specimens={collectionState.specimens}
              />

              <div className="mt-8 border-t border-[var(--color-border)] pt-8">
                <ImportCollectionForm
                  onImported={handleCollectionImported}
                />
              </div>
            </Surface>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}