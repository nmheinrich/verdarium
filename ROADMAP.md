# Roadmap

_Last reviewed: 2026-09-24 · Reviewed weekly via `routines/weekly-roadmap-review.md`_

## North star

Turn a plant collection into a beautiful, organized botanical archive, and make ongoing care easier without letting care take over.

## Current goal: collector-ready MVP

Get a coherent, polished MVP into the hands of real plant collectors and find out whether archive-first positioning is compelling enough to eventually support a paid tier. The app is **free** for now. A Buy me a coffee link is planned but on hold.

### MVP exit criteria

- [ ] The app follows the design system (tokens, type, UI primitives) — `specs/003-design-system-adoption.md`
- [ ] Care can be recorded directly from a specimen tile (record, note, snooze, skip), and the tile shows due or overdue state calmly — `specs/001-care-on-tiles.md`
- [ ] "Due today" is a collection filter, and "Due next" replaces the Care view as a secondary view
- [ ] A first-run experience lets a new collector add their first 3–5 specimens without confusion
- [ ] Sign-in, sync, and sharing work reliably on production (https://verdarium-neon.vercel.app, live, env vars mapped in Vercel)
- [ ] All three themes are polished on desktop and mobile widths
- [ ] README describes the product rather than the Vite template
- [ ] A demo set exists: hero screenshots plus 3 flow clips (`demos/`)

## Now

| Item | Spec | Status |
|---|---|---|
| Redesign phase 1: tokens, type (TAY Roony fetched at build) and UI primitives | `specs/003-design-system-adoption.md` | Merged (#5) |
| Redesign phase 2: header, collection filters (Due today), museum-label tiles, illustration picker | `specs/003-design-system-adoption.md`, `specs/001-care-on-tiles.md` | Merged (#7) |
| Host TAY Roony in a private Supabase bucket and set `TAYROONY_WOFF2_URL` in Vercel | spec 003 | On hold; Heinrich adds it to Vercel (the live font 404s until then) |
| Add specimen tile, filters and navigation to the design system | `specs/003-design-system-adoption.md` | In progress |
| Redesign phase 3: Record care on tiles, care note (migration), undo, snooze and skip, Due next view | `specs/001-care-on-tiles.md` | Merged (#8); note migration applied |
| Care in the expanded specimen view (record, note, undo, snooze, skip from the record) | `specs/001-care-on-tiles.md` | Merged (#9) |
| Require confirm password on sign up | — | Merged (#10) |
| Delete account (Settings danger zone; immediate, permanent, no soft delete) | — | PR (#11) |
| **Bug:** share links returned 404 in production (no SPA rewrite) | — | Fixed (#3) |
| **Bug:** production blank after first Git-built deploy (Supabase env overridden in `vite.config.ts`) | — | Fixed (#4) |
| **Bug:** export and import are not reachable in the app (`ExportCollectionForm` and `ImportCollectionForm` are never rendered) | — | Fixed in phase 3 (Settings; import now writes to the cloud archive) |
| **Bug:** snooze offers dates on or before the current due date, and the server rejects them with a vague error | spec 001 | Fixed in phase 3 |
| **Bug:** the Care card illustration overflows its 10rem column and draws a line through the text | spec 003, phase 4 | Fixed in phase 3 (Care card removed) |
| **Bug:** tile illustrations were cropped at the bottom of the plate | spec 003 | Fixed in phase 3 |
| **Bug:** navigating (for example after adding a specimen or opening one) keeps the old scroll position | — | Fixed in phase 2 |

## Next

- Design system phases 2 and 4: fonts, then applying it across the app (`specs/003-design-system-adoption.md`)
- Private font source and build-time fetch for TAY Roony (spec 003)
- First-run and onboarding polish, including an empty collection state and a sample specimen
- Replace the README with product and developer docs
- Capture the first demo set for posting online
- Recruit the first 5–10 collectors (see `customers/README.md`)

## Later (post-validation)

- Buy me a coffee support link (`specs/002-support-link.md`), on hold
- Premium tier for larger collections: specimen count threshold, price, and features to be decided (`context/pricing.md`)
- Care history timeline and insights per specimen
- Expanded illustration library
- Household or shared-collection editing (beyond read-only sharing)
- Provenance extras: nursery or source records, lineage and propagation tracking
- Automating the routines (scheduled agents)

## Validation plan

**Question:** Is the archive-first positioning compelling enough that collectors adopt it over notes, spreadsheets, and generic plant apps, and would some of them eventually pay?

**Signals to watch** (targets to be set once testers are recruited):
- The collector adds 10 or more specimens in the first week
- They return and log care over 2 or more weeks
- They share their collection or show it to someone
- Unprompted, they describe it with archive or pride language rather than reminder language
- They click the support link, or say they'd pay for more capacity

**Out of scope for now:** payments, plant identification, social feeds, and photography-first features.

## Decision log

| Date | Decision |
|---|---|
| 2026-09-24 | Delete account is immediate and permanent, no soft delete; implemented as a Postgres RPC (`security definer`, calls `delete from auth.users` for the caller only) rather than a new Edge Function, since deleting the auth row cascades through the existing collection/specimen/care-event foreign keys |
| 2026-09-23 | App is free during validation; add Buy me a coffee; consider a premium tier for large collections later |
| 2026-09-23 | Care moves onto specimen tiles; the Care view becomes a secondary "Due today" list |
| 2026-09-23 | PR-based flow: Claude pushes branches and opens PRs, and Heinrich merges to `main` (production) |
| 2026-09-24 | "Due today" is a collection filter; "Due next" is the new secondary view replacing Care |
| 2026-09-24 | Recording care allows a note in a minimal popover |
| 2026-09-24 | Due and overdue float to the top only when the Due today filter is on |
| 2026-09-24 | Care notes travel with the record: Record care commits after a 6-second Undo window, so the note is sent with `record_specimen_care` instead of a separate `add_care_note` RPC |
| 2026-09-24 | Support link on hold |
| 2026-09-24 | TAY Roony stays out of git and is fetched at Vercel build time from a private source |
| 2026-09-24 | Only the newest design system artifact counts; older redesign artifacts are superseded |
| 2026-09-24 | Redesign: the Verdarium design system artifact is the visual source of truth |
| 2026-09-23 | Real customer notes are kept out of the public repo (`customers/private/`, gitignored) |
