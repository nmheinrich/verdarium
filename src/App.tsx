//  import { Plus } from "lucide-react";
//  import { Dashboard } from "@/components/dashboard";
//  import {
//    AppNav,
//    AppShell,
//    PageHeader,
//  } from "@/components/layout";
//  import { Button } from "@/components/ui";
//  import { loadCollection } from "@/storage";
//  const navigationItems = [
//    { label: "Collection", value: "collection" },
//    { label: "Reminders", value: "reminders" },
//    { label: "Settings", value: "settings" },
//  ];
//  export default function App() {
//    const collectionResult = loadCollection();
//    const specimens = collectionResult.success
//      ? collectionResult.data
//      : [];
//    const loadError = collectionResult.success
//      ? null
//      : collectionResult.error;
//    return (
//      <AppShell
//        navigation={
//          <AppNav
//            items={navigationItems}
//            activeItem="collection"
//          />
//        }
//        actions={
//          <Button
//            size="compact"
//            leadingIcon={<Plus size={16} />}
//          >
//            Add specimen
//          </Button>
//        }
//      >
//        <PageHeader
//          eyebrow="Personal Herbarium"
//          title="Collection"
//          description="A quiet archive for documenting, studying, and caring for your botanical specimens."
//        />
//        <Dashboard
//          specimens={specimens}
//          loadError={loadError}
//        />
//      </AppShell>
//    );
//   }

import { Plus } from "lucide-react";

import {
  CompactCollectionView,
  Dashboard,
} from "@/components/dashboard";
import {
  AppNav,
  AppShell,
  PageHeader,
} from "@/components/layout";
import { Button } from "@/components/ui";
import { loadCollection } from "@/storage";
import type { Specimen } from "@/types";

const navigationItems = [
  { label: "Collection", value: "collection" },
  { label: "Reminders", value: "reminders" },
  { label: "Settings", value: "settings" },
];

const compactViewPreviewSpecimens: Specimen[] = [
  {
    id: "feature-7-preview-monstera",
    commonName: "Swiss Cheese Plant",
    scientificName: "Monstera deliciosa",
    classification: {
      family: "Araceae",
      genus: "Monstera",
      species: "deliciosa",
    },
    location: {
      room: "Library",
      position: "North window",
    },
    healthStatus: "thriving",
    lightPreference: "bright-indirect",
    tags: [],
    isFavorite: true,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
  {
    id: "feature-7-preview-ficus",
    commonName: "Rubber Plant",
    scientificName: "Ficus elastica",
    classification: {
      family: "Moraceae",
      genus: "Ficus",
      species: "elastica",
    },
    location: {
      room: "Living room",
    },
    healthStatus: "stable",
    lightPreference: "bright-indirect",
    tags: [],
    isFavorite: false,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
  {
    id: "feature-7-preview-calathea",
    commonName: "Prayer Plant",
    scientificName: "Goeppertia orbifolia",
    classification: {
      family: "Marantaceae",
      genus: "Goeppertia",
      species: "orbifolia",
    },
    location: {
      room: "Bedroom",
      position: "East wall",
    },
    healthStatus: "watch",
    lightPreference: "medium",
    tags: [],
    isFavorite: true,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
  {
    id: "feature-7-preview-pothos",
    commonName: "Golden Pothos",
    scientificName: "Epipremnum aureum",
    classification: {
      family: "Araceae",
      genus: "Epipremnum",
      species: "aureum",
    },
    location: {
      room: "Office",
    },
    healthStatus: "recovering",
    lightPreference: "medium",
    tags: [],
    isFavorite: false,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
  {
    id: "feature-7-preview-sansevieria",
    commonName: "Snake Plant",
    scientificName: "Dracaena trifasciata",
    classification: {
      family: "Asparagaceae",
      genus: "Dracaena",
      species: "trifasciata",
    },
    healthStatus: "thriving",
    lightPreference: "low",
    tags: [],
    isFavorite: false,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
  {
    id: "feature-7-preview-philodendron",
    commonName: "Heartleaf Philodendron",
    scientificName: "Philodendron hederaceum",
    classification: {
      family: "Araceae",
      genus: "Philodendron",
      species: "hederaceum",
    },
    location: {
      room: "Kitchen",
      position: "West shelf",
    },
    healthStatus: "stable",
    lightPreference: "bright-indirect",
    tags: [],
    isFavorite: true,
    createdAt: "2026-08-27T12:00:00.000Z",
    updatedAt: "2026-08-27T12:00:00.000Z",
  },
];

export default function App() {
  const collectionResult = loadCollection();

  const specimens = collectionResult.success
    ? collectionResult.data
    : [];

  const loadError = collectionResult.success
    ? null
    : collectionResult.error;

  return (
    <AppShell
      navigation={
        <AppNav
          items={navigationItems}
          activeItem="collection"
        />
      }
      actions={
        <Button
          size="compact"
          leadingIcon={<Plus size={16} />}
        >
          Add specimen
        </Button>
      }
    >
      <PageHeader
        eyebrow="Personal Herbarium"
        title="Collection"
        description="A quiet archive for documenting, studying, and caring for your botanical specimens."
      />

      <Dashboard
        specimens={specimens}
        loadError={loadError}
      />

      <section
        aria-labelledby="compact-view-preview-heading"
        className="mt-12 border-t border-[var(--color-border)] pt-10"
      >
        <div className="mb-8">
          <p className="metadata-label">Feature 7 review</p>

          <h2
            id="compact-view-preview-heading"
            className="mt-2 font-serif text-2xl leading-tight text-[var(--color-text-primary)]"
          >
            Compact collection view
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Temporary development preview for evaluating collection density,
            card proportions, and responsive behavior.
          </p>
        </div>

        <CompactCollectionView specimens={compactViewPreviewSpecimens} />
      </section>
    </AppShell>
  );
}