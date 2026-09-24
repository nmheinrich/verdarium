# Product

## One line

Verdarium turns a personal plant collection into a beautiful, organized botanical archive and makes ongoing care easier.

## Who it's for

- **Collectors and hobbyists** whose collections have outgrown memory, notes apps, and spreadsheets
- **Design-conscious plant owners** who care how their tools look and feel
- **Specialists:** small conservatories, botanical enthusiasts, specialty growers, and interior plant professionals
- **Households** maintaining a shared collection

Personas are in `customers/personas.md`.

## The pain

- Plant information is fragmented across memory, notes, spreadsheets, nursery tags, photos, and reminder apps.
- Owners forget watering or care history and lose provenance and acquisition details.
- There's no satisfying way to see the collection as a whole.
- Existing plant apps feel utilitarian or generic, focus too heavily on identification, or are just another checklist. They don't reflect the pride and attachment people feel toward a carefully built collection.

## The promise

- **Collection first, not reminder first.** The archive is the product, and care supports it.
- **Structured specimen records:** scientific-style metadata (family, genus, species, cultivar), location, acquisition date and source, health, light, and notes.
- **A calm scientific and archival aesthetic** that feels like a personal herbarium or museum catalog.
- **Curated botanical illustrations** rather than photography.
- **Premium visual design** throughout.
- **Care that supports the collection instead of dominating it:** recorded where the specimen lives, on its tile.

## What exists today (as of 2026-09-23)

- Specimen CRUD with classification, location, health, light, acquisition, tags, favourites, and illustration
- Dashboard with search, filters, sort, summary, recent specimens, and compact and expanded views
- Care reminders (interval-based) with record, skip, and snooze, care history, and a separate Care view
- Three themes: Archive, Herbarium, Night Archive
- Local-first storage, JSON import and export
- Supabase auth and cloud sync, with conflict resolution between local and cloud collections
- Read-only collection sharing via `/shared/:token`
- Deployment on Vercel and Supabase through Stripe Projects

## What it is not

Not a plant identifier, not a social network, not a gamified habit tracker, and not a photo gallery.
