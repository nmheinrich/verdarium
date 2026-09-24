# 003 — Design system adoption (redesign)

**Status:** draft · **Roadmap:** Now · **Owner:** Heinrich

**Source of truth:** the Verdarium design system artifact, https://claude.ai/artifact/LH7dSvQKKg6XxccrmMcwjN (synced from `main@cf318bb` on 2026-09-24, then adjusted). Read its `project/README.md` and `project/tokens.json` before any UI work.

## Problem
The app's tokens, type and UI primitives have drifted from the intended look. The design system redesigns them. Its specific changes:
- **Archive palette:** moves from parchment to linen whites (page `#f8f6f0`, tiles `#fcfaf6`).
- **Greens:** Herbarium gets a fern green (`#36683f`) and Night Archive a lichen green (`#a1c799`).
- **Contrast:** secondary and muted text are darker so they reach 4.5:1.
- **New tokens:** `color-botanical-hover`, `color-reminder-due-ink`, `color-reminder-overdue-ink`, `radius-full`, `shadow-control`, and shadows per theme.
- **Primary button:** a solid botanical fill. The current primary puts parchment text on botanical-soft, at 1.2:1 contrast.
- **Type:** today's system fonts and Georgia are replaced by **TAY Roony** (display, caps only), **Newsreader** italic (scientific names) and **Figtree** (UI).

## Goal
Bring the app in line with the design system so every new feature (starting with `001`) is built on it.

Only the newest design system artifact counts. The older "redesign concept" and "Redesign Notes for Web Designer" artifacts (2026-09-19) are superseded.

The design system now includes **SpecimenTile**, **CollectionFilters** and **AppNav** (added 2026-09-24, version 17). Phase 4 builds the collection grid, toolbar and header from them. The tile opens only from its name, so the tile-wide overlay button in `CompactSpecimenCard` goes away and in-tile care actions work.

## Non-goals (this spec)
- Forms and dialogs beyond the UI primitives (to be added to the design system later)
- New illustrations.

## Phases (each a separate PR)

1. **Tokens.** Update `src/styles/tokens.css` to match `tokens.json` for all three themes (`data-theme` on `:root`), and add the new tokens. Add the per-theme shadows and the radius and spacing tokens (`page-padding-inline`, `page-max-width`).
2. **Type.** Add the fonts:
   - Newsreader and Figtree from Google Fonts with `display=swap`
   - TAY Roony kept **out of git** and fetched during the Vercel build (see "Font hosting" below)
   
   Then define the type styles as utilities: `display`, `headline`, `title`, `subtitle`, `scientific-name`, `body-lg`, `body`, `button`, `caption`, `metadata-label`. Keep the fallbacks so layout holds if a font fails.
3. **UI primitives.** Rebuild `src/components/ui` (`Button`, `IconButton`, `Input`, `Badge`, `Surface`) to the design system's variants, sizes and states:
   - Button: primary, secondary, tonal, ghost; `sm` 32px, `md` 40px, `lg` 48px; a loading state
   - Badge: neutral, botanical, and the three reminder states with dots
   - Focus: a 2px `color-focus` outline with a 2px offset. Inputs use a `color-botanical` edge with a `color-botanical-soft` halo.
   - Motion: 160ms and 120ms on `cubic-bezier(0.2, 0, 0, 1)`, with reduced-motion respected
4. **Apply.** Update the app surfaces:
   - tiles as museum labels, with the common name in `subtitle` (never truncated, `text-wrap: balance`) and the scientific name in `scientific-name`
   - headings in TAY Roony
   - copy moved to the curator voice
   
   Check every view in the three themes on desktop and mobile.

## Font hosting (decided 2026-09-24)
TAY Roony is licensed and the repo is public, so its files are **never committed**. The Vercel build fetches them from a private source.
- **Storage:** a private Supabase Storage bucket (for example `build-assets/fonts/`), or another private location Heinrich picks. The bucket must not be public.
- **Build:** a `prebuild` script (`scripts/fetch-fonts.mjs`) downloads `TAYRoony.woff2` and `.woff` into `public/fonts/` using a server-only credential. It must never use a `VITE_*` variable, because those end up in the client bundle.
- **Vercel env:** add something like `FONT_SOURCE_URL` and `FONT_SOURCE_TOKEN` for the Build step, in both Preview and Production.
- **Git:** add `public/fonts/` to `.gitignore`.
- **Local dev:** the same script runs with the credential from `.env`. If it can't fetch, the build still passes and the Newsreader fallback is used, with a clear warning printed.
- **Note:** once deployed, the woff2 is served publicly to browsers, as with any web font. Confirm the TAY Roony web license covers self-hosting on `verdarium-neon.vercel.app`.

## Acceptance criteria
- [ ] No hardcoded colors. Every token from `tokens.json` exists in `tokens.css` for all three themes.
- [ ] Text contrast is 4.5:1 or better and input borders 3:1 or better in every theme. Spot-check with devtools.
- [ ] One primary button per view
- [ ] Plant names are never truncated with an ellipsis
- [ ] TAY Roony is never bolded, no dashes appear in display headings, and source copy is sentence case
- [ ] Lighthouse or visual check shows no layout shift from font loading beyond `swap`
- [ ] Screenshots of before and after in each theme are added to the PR (and good ones go to `demos/screenshots/`)

## Open questions
- Where should the private font source live? A Supabase Storage bucket is the proposed default.

## Demo moment
Before and after of the full archive in each theme. This is the hero screenshot set for `demos/`.
