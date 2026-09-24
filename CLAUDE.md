<!-- stripe-projects-cli managed:claude-md:start -->
look at AGENTS.md for your rules
<!-- stripe-projects-cli managed:claude-md:end -->

# Verdarium — working agreement

Verdarium is a premium digital botanical archive: a place to catalog, organize, and care for a personal plant collection, presented like a herbarium or museum catalog rather than a task app. Read `context/product.md` before making product or UX decisions.

## Current goal

Reach a coherent MVP polished enough to put in front of real plant collectors, and learn whether archive-first positioning is compelling enough to support a paid product later. The headline MVP changes are the **design system redesign** (`specs/003-design-system-adoption.md`) and **care recorded directly on specimen tiles** (`specs/001-care-on-tiles.md`). Priorities live in `ROADMAP.md`. If a request conflicts with the roadmap, say so before starting.

## Workspace map

| Path | What it holds |
|---|---|
| `ROADMAP.md` | Now / Next / Later, MVP exit criteria, validation plan |
| `REVIEW.md` | Definition of done and PR review checklist |
| `context/` | Product, positioning, design language, tech stack, pricing |
| `customers/` | Personas and templates. Real notes go in `customers/private/` (gitignored) |
| `specs/` | One spec per feature, numbered. Write or update one before non-trivial work |
| `demos/` | Marketing material: screenshots, flow clips, shot lists |
| `routines/` | Recurring checklists: weekly roadmap review, pre-deploy, Supabase migrations |

## Stack at a glance

React 19 + TypeScript + Vite 8, Tailwind 4 with CSS tokens (`src/styles/tokens.css`), framer-motion, lucide-react, date-fns. Supabase for auth, sync, sharing, and care history. Deployed on Vercel at https://verdarium-neon.vercel.app. Providers and credentials are managed with **Stripe Projects** (`stripe projects …`). Details are in `context/stack.md`.

```bash
npm run dev      # local dev server
npm run lint     # eslint
npm run build    # tsc -b && vite build — must pass before any PR
```

## Rules

**Git and deploys**
- Never commit to `main` directly. Branch as `feat/…`, `fix/…`, or `chore/…`, push, and open a PR for Heinrich to merge. `main` is production.
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`), matching the existing history.
- Run `routines/pre-deploy-check.md` before asking for a merge.
- Only deploy to Vercel production when explicitly asked. Preview deploys are fine.

**Secrets and data**
- The repo is **public**. Never commit `.env`, `.projects/vault`, tokens, customer names, emails, or interview notes.
- Get credentials through `stripe projects env` rather than asking for them or hardcoding them.
- Real customer material goes only in `customers/private/`.

**Supabase**
- Schema changes go in a new timestamped file in `supabase/migrations/`. Never edit a migration that has already been applied.
- Every new table needs RLS. RPCs need explicit grants (see `20260922014500_restrict_care_rpc_permissions.sql`).
- Follow `routines/supabase-migration-check.md` for any migration PR.

**Product and design**
- The **Verdarium design system** artifact (https://claude.ai/artifact/LH7dSvQKKg6XxccrmMcwjN) is the visual source of truth. Read its `project/README.md` through the Artifact tool before any UI work. Summary and rules are in `context/brand-and-design.md`.
- Collection first, care second. Care supports the archive and must never make it feel like a checklist app.
- Use curated botanical illustrations (`src/constants/illustrations.ts`), not photography.
- Use design tokens and `components/ui` primitives. No hardcoded colors. All three themes (Archive, Herbarium, Night Archive) must look right.
- Don't commit licensed font files (TAY Roony) to this public repo until licensing is settled (see spec 003).
- Respect `prefers-reduced-motion` (see the `useReducedMotion` usage in `App.tsx`).
- The tone is calm, precise, and scientific. Use specimen, archive, and record vocabulary; avoid gamification and exclamation marks.

**Working style**
- For anything bigger than a small fix, write or update a spec in `specs/` first and get agreement.
- Report honestly. If lint or build fails, or something wasn't verified in the browser, say so.
