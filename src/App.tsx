import { useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { ExpandedSpecimenView } from "@/components/cards";
import { Dashboard } from "@/components/dashboard";
import {
  AddSpecimenForm,
  EditSpecimenForm,
} from "@/components/forms";
import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import { Button } from "@/components/ui";
import type { CollectionStorageError } from "@/storage";
import { loadCollection } from "@/storage";
import type { Specimen } from "@/types";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Reminders", value: "reminders" },
  { label: "Settings", value: "settings" },
];

type AppView =
  | "collection"
  | "add-specimen"
  | "specimen"
  | "edit-specimen";

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

  const [collectionState, setCollectionState] =
    useState<CollectionState>(() =>
      loadCollectionState(),
    );

  const [selectedSpecimenId, setSelectedSpecimenId] =
    useState<string | null>(null);

  const selectedSpecimen =
    selectedSpecimenId === null
      ? null
      : collectionState.specimens.find(
          (specimen) =>
            specimen.id === selectedSpecimenId,
        ) ?? null;

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

  const handleCancelAddSpecimen = () => {
    setView("collection");
  };

  const handleSelectSpecimen = (
    specimen: Specimen,
  ) => {
    setSelectedSpecimenId(specimen.id);
    setView("specimen");
  };

  const handleReturnToCollection = () => {
    setSelectedSpecimenId(null);
    setView("collection");
  };

  const handleEditSpecimen = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setView("edit-specimen");
  };

  const handleCancelEditSpecimen = () => {
    if (!selectedSpecimen) {
      handleReturnToCollection();
      return;
    }

    setView("specimen");
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
          activeItem="collection"
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
            <ExpandedSpecimenView
              specimen={selectedSpecimen}
              actions={
                <Button
                  size="compact"
                  variant="secondary"
                  leadingIcon={<Pencil size={15} />}
                  onClick={handleEditSpecimen}
                >
                  Edit specimen
                </Button>
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
    </AppShell>
  );
}