# 002 — Support link (Buy me a coffee)

**Status:** draft · **Roadmap:** Next · **Owner:** Heinrich

## Problem
Verdarium is free during validation. Appreciative collectors have no way to support it, and we have no lightweight signal of willingness to pay.

## Goal
A tasteful, optional support link that fits the archive tone.

## Non-goals
Payments inside the app, paywalls, and nag prompts.

## User experience
- Placement: the Settings view (an "About Verdarium" section) and the account menu. Never on the collection or care surfaces.
- Copy (a draft in the archive voice): "Verdarium is free while it grows. If it has earned a place in your collection, you can support its care." → **Support Verdarium**
- Opens the Buy me a coffee page in a new tab (`rel="noopener noreferrer"`).
- No shouting orange Buy me a coffee branding. Use a themed `Button` variant.

## Data and backend
- Keep the URL in `src/constants/app.ts`.
- Optional: count clicks later if analytics are added. Nothing for now.

## Acceptance criteria
- [ ] Link visible in Settings and the account menu, and styled with tokens in all three themes
- [ ] Opens externally, safely
- [ ] Copy reviewed against `context/brand-and-design.md`

## Open questions
- What is the Buy me a coffee page URL? Heinrich needs to create the page.
