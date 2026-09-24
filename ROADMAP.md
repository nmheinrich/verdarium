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
| Design system adoption, phase 1 (tokens) and phase 3 (UI primitives) | `specs/003-design-system-adoption.md` | Draft spec |
| Decide TAY Roony licensing / hosting (blocks type phase) | `specs/003-design-system-adoption.md` | Needs Heinrich |
| Care on specimen tiles, with a note popover, the Due today filter and the Due next view | `specs/001-care-on-tiles.md` | Agreed |

## Next

- Design system phases 2 and 4: fonts, then applying it across the app (`specs/003-design-system-adoption.md`)
- Extend the design system to app-level components (specimen tile, filters, nav, dialogs)
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
| 2026-09-23 | App is free during validation; add Buy me a coffee; consider a premium tier for large collections later |
| 2026-09-23 | Care moves onto specimen tiles; the Care view becomes a secondary "Due today" list |
| 2026-09-23 | PR-based flow: Claude pushes branches and opens PRs, and Heinrich merges to `main` (production) |
| 2026-09-24 | "Due today" is a collection filter; "Due next" is the new secondary view replacing Care |
| 2026-09-24 | Recording care allows a note in a minimal popover |
| 2026-09-24 | Due and overdue float to the top only when the Due today filter is on |
| 2026-09-24 | Support link on hold |
| 2026-09-24 | Redesign: the Verdarium design system artifact is the visual source of truth |
| 2026-09-23 | Real customer notes are kept out of the public repo (`customers/private/`, gitignored) |
