# Roadmap

_Last reviewed: 2026-09-23 · Reviewed weekly via `routines/weekly-roadmap-review.md`_

## North star

Turn a plant collection into a beautiful, organized botanical archive, and make ongoing care easier without letting care take over.

## Current goal: collector-ready MVP

Get a coherent, polished MVP into the hands of real plant collectors and find out whether archive-first positioning is compelling enough to eventually support a paid tier. The app is **free** for now, with an optional "Buy me a coffee" link.

### MVP exit criteria

- [ ] Care can be logged directly from a specimen tile (watered, done, snooze, skip), and the tile shows due or overdue state calmly — `specs/001-care-on-tiles.md`
- [ ] The Care view is reframed as a secondary "Due today" list, not a primary destination
- [ ] A first-run experience lets a new collector add their first 3–5 specimens without confusion
- [ ] Sign-in, sync, and sharing work reliably on production (https://verdarium-neon.vercel.app, live, env vars mapped in Vercel)
- [ ] All three themes are polished on desktop and mobile widths
- [ ] Support link is in place — `specs/002-support-link.md`
- [ ] README describes the product rather than the Vite template
- [ ] A demo set exists: hero screenshots plus 3 flow clips (`demos/`)

## Now

| Item | Spec | Status |
|---|---|---|
| Care on specimen tiles | `specs/001-care-on-tiles.md` | Draft spec |
| "Due today" as a secondary view | `specs/001-care-on-tiles.md` | Draft spec |

## Next

- Buy me a coffee support link (`specs/002-support-link.md`)
- First-run and onboarding polish, including an empty collection state and a sample specimen
- Replace the README with product and developer docs
- Capture the first demo set for posting online
- Recruit the first 5–10 collectors (see `customers/README.md`)

## Later (post-validation)

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
| 2026-09-23 | Real customer notes are kept out of the public repo (`customers/private/`, gitignored) |
