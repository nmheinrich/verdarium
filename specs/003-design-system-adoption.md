# 003 — Design system adoption (redesign)

**Status:** in progress — tokens, type utilities, UI primitives, and tiles/filters/navigation are applied (#5, #6/#7 merged; the tile, filters and nav were also added to the design system artifact on 2026-09-24). Blocked on hosting the TAY Roony font (`TAYROONY_WOFF2_URL` in Vercel, tracked in `ROADMAP.md`) before the acceptance criteria below can be verified · **Roadmap:** Now · **Owner:** Heinrich

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

The specimen tile, filters and navigation are being added to the design system (2026-09-24), so phase 4 builds from those designs.

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

## Font hosting (decided 2026-09-24, implemented)
TAY Roony is licensed and the repo is public, so its files are **never committed**. The Vercel build fetches them from a private source.
- **Storage:** a private Supabase Storage bucket, decided as the default (execution — uploading the file and setting the Vercel env var — is pending; tracked in `ROADMAP.md`).
- **Build:** a `prebuild`/`predev` script (`scripts/fetch-fonts.mjs`, shipped) downloads `TAYRoony.woff2` into `public/fonts/` using a server-only credential. It never uses a `VITE_*` variable, because those end up in the client bundle.
- **Vercel env:** the implemented variable is a single signed URL, `TAYROONY_WOFF2_URL`, for the Build step in both Preview and Production. (This spec originally proposed separate `FONT_SOURCE_URL`/`FONT_SOURCE_TOKEN` variables; the shipped script uses one signed URL instead.)
- **Git:** `public/fonts/` is gitignored.
- **Local dev:** the same script runs with the credential from `.env`/`.env.local`. If `TAYROONY_WOFF2_URL` isn't set, the build still passes, the Newsreader fallback is used, and a warning is printed. This is the current state of production: the variable isn't set in Vercel yet, so the live font 404s and falls back.
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
- ~~Where should the private font source live?~~ Decided: a private Supabase Storage bucket. Uploading the file and setting `TAYROONY_WOFF2_URL` in Vercel is the pending action (tracked in `ROADMAP.md`).

## Demo moment
Before and after of the full archive in each theme. This is the hero screenshot set for `demos/`.
