import { useState } from "react";
import { Plus } from "lucide-react";

import { Dashboard } from "@/components/dashboard";
import { AddSpecimenForm } from "@/components/forms";
import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import { Button } from "@/components/ui";
import { loadCollection } from "@/storage";
import type { CollectionStorageError } from "@/storage";
import type { Specimen } from "@/types";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Reminders", value: "reminders" },
  { label: "Settings", value: "settings" },
];

type AppView =
  | "collection"
  | "add-specimen";

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

  const handleSpecimenCreated = (
    specimens: Specimen[],
  ) => {
    setCollectionState({
      specimens,
      error: null,
    });

    setView("collection");
  };

  const handleCancelAddSpecimen = () => {
    setView("collection");
  };

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
          />
        </>
      ) : (
        <>
          <PageHeader
            eyebrow="Specimen Intake"
            title="Add specimen"
            description="Create a new botanical record for your personal herbarium."
          />

          <div className="mt-8">
            <AddSpecimenForm
              onCancel={handleCancelAddSpecimen}
              onCreated={handleSpecimenCreated}
            />
          </div>
        </>
      )}
    </AppShell>
  );
}