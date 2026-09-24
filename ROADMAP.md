# Roadmap

_Last reviewed: 2026-09-24 · Reviewed weekly via `routines/weekly-roadmap-review.md`_

## North star

Turn a plant collection into a beautiful, organized botanical archive, and make ongoing care easier without letting care take over.

## Current goal: collector-ready MVP

Get a coherent, polished MVP into the hands of real plant collectors and find out whether archive-first positioning is compelling enough to eventually support a paid tier. The app is **free** for now. A Buy me a coffee link is planned but on hold.

### MVP exit criteria

- [ ] The app follows the design system (tokens, type, UI primitives) — `specs/003-design-system-adoption.md`. Tokens, type utilities, UI primitives, tiles, filters and navigation are applied; blocked on the TAY Roony font going live before this can be checked off
- [x] Care can be recorded directly from a specimen tile (record, note, snooze, skip), and the tile shows due or overdue state calmly — `specs/001-care-on-tiles.md`
- [x] "Due today" is a collection filter, and "Due next" replaces the Care view as a secondary view
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
| Add specimen tile, filters and navigation to the design system | `specs/003-design-system-adoption.md` | Done (2026-09-24, in the design system artifact) |
| Redesign phase 3: Record care on tiles, care note (migration), undo, snooze and skip, Due next view | `specs/001-care-on-tiles.md` | Merged (#8); note migration applied |
| Care in the expanded specimen view (record, note, undo, snooze, skip from the record) | `specs/001-care-on-tiles.md` | Merged (#9) |
| Require confirm password on sign up | — | Merged (#10) |
| Delete account (Settings danger zone; immediate, permanent, no soft delete) | — | Merged (#11); not yet confirmed on production — needs a disposable-account test |
| Confirm the product name — a live `verdarium.green` was found; decide keep or rename before the README rewrite and demo capture | — | Needs decision (Heinrich) |
| **Bug:** share links returned 404 in production (no SPA rewrite) | — | Fixed (#3) |
| **Bug:** production blank after first Git-built deploy (Supabase env overridden in `vite.config.ts`) | — | Fixed (#4) |
| **Bug:** export and import are not reachable in the app (`ExportCollectionForm` and `ImportCollectionForm` are never rendered) | — | Fixed in phase 3 (Settings; import now writes to the cloud archive) |
| **Bug:** snooze offers dates on or before the current due date, and the server rejects them with a vague error | spec 001 | Fixed in phase 3 |
| **Bug:** the Care card illustration overflows its 10rem column and draws a line through the text | spec 003, phase 4 | Fixed in phase 3 (Care card removed) |
| **Bug:** tile illustrations were cropped at the bottom of the plate | spec 003 | Fixed in phase 3 |
| **Bug:** navigating (for example after adding a specimen or opening one) keeps the old scroll position | — | Fixed in phase 2 |

## Next

- Design system final QA against spec 003's acceptance criteria (contrast, no truncated names, no layout shift) once TAY Roony is live in Vercel
- First-run and onboarding polish, including an empty collection state and a sample specimen
- Replace the README with product and developer docs (blocked on the name decision above)
- Capture the first demo set for posting online (blocked on the name decision above)
- Recruit the first 5–10 collectors (see `customers/README.md`)

## Later (post-validation)

- Buy me a coffee support link (`specs/002-support-link.md`), on hold
- Premium tier for larger collections: specimen count threshold, price, and features to be decided (`context/pricing.md`)
- Care history timeline and insights per specimen
- Expanded illustration library
- Household or shared-collection editing (beyond read-only sharing)
- Provenance extras: nursery or source records, lineage and propagation tracking
- Automating the routines (scheduled agents)
- **Public Botanical Collections:** a true publish mode (stable URL, featured specimens, a public-facing layout) built on the sharing infrastructure that already exists (`get_shared_collection()` already strips private fields). Highest-ranked of the ideas below — it directly serves the validation plan's "they share their collection" signal.
- **Multi-device reliability polish:** stronger conflict handling, clearer sync status, cross-tab consistency, safer recovery from failed mutations. Not user-facing, but protects every other feature, including Public Collections.
- **Collection statistics and insights:** specimen counts, health/light distribution, genus and family frequency, acquisition trends — mostly derivable client-side from data already in memory. Needs a tone-focused spec so it reads archival, not like a productivity dashboard.
- **Botanical journal:** a narrative, observational log distinct from care's structured operational history. Worth waiting for signal that people actually use the care-note field before building an adjacent second history concept.
- **Botanical taxonomy database:** a structured reference source to validate/suggest genus, species and family. Real long-term value but a genuinely large, separate undertaking (licensing or curating real botanical data, handling synonyms/cultivars/hybrids); infrastructure, not a felt feature. Lowest priority of this set.
- **Image uploads:** flagged, not just ranked last. This directly conflicts with an existing, repeated, deliberate decision (CLAUDE.md, `context/product.md`, `context/brand-and-design.md`: curated illustrations, never photography; this roadmap's own "out of scope" line below already names "photography-first features"). Needs a conscious decision to reverse that positioning before it's even a scoping question — not a scheduling one.

## Validation plan

**Question:** Is the archive-first positioning compelling enough that collectors adopt it over notes, spreadsheets, and generic plant apps, and would some of them eventually pay?

**Signals to watch** (targets to be set once testers are recruited):
- The collector adds 10 or more specimens in the first week
- They return and log care over 2 or more weeks
- They share their collection or show it to someone
- Unprompted, they describe it with archive or pride language rather than reminder language
- They click the support link, or say they'd pay for more capacity

**Status (2026-09-24):** no testers recruited yet, so none of the signals above have data. `customers/private/feedback-log.md` doesn't exist yet.

**Out of scope for now:** payments, plant identification, social feeds, and photography-first features.

## Decision log

| Date | Decision |
|---|---|
| 2026-09-24 | First run of `routines/weekly-roadmap-review.md`. Redesign (#5–#7) and care-on-tiles (#8) were confirmed working on production, signed in, by Heinrich; confirm-password (#10) and delete account (#11) have not been separately confirmed on production yet |
| 2026-09-24 | Considered letting an account hold more than one collection; declined for now. It conflicts with the stated "one account, one collection" positioning and the `collections_owner_id_key` invariant, and the likely underlying need (organizing a large archive) is probably already served by `location`, `tags` and the existing filters. Revisit only if real usage shows a specific need a second collection actually solves (for example a hard privacy boundary, or a distinct sharing scope) |
| 2026-09-24 | Reviewed and ranked six post-MVP feature ideas (public collections, stats, journal, multi-device polish, taxonomy database, image uploads); none scheduled — see Later, ranked highest to lowest |
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
