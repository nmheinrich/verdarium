# Tech stack and infrastructure

## App

- **React 19 + TypeScript + Vite 8.** The `@/` alias maps to `src/`.
- **Tailwind 4** (`@tailwindcss/vite`) with CSS custom-property tokens in `src/styles/tokens.css`.
- **framer-motion** for motion, **lucide-react** for icons, **date-fns** for dates.

## Source layout

| Path | Responsibility |
|---|---|
| `src/App.tsx` | View routing (`collection`, `care`, `specimen`, `settings`, …) and top-level state |
| `src/components/` | `ui/` primitives, `cards/`, `dashboard/`, `care/`, `forms/`, `sharing/`, `auth/`, `layout/`, `illustrations/` |
| `src/types/` | `Specimen`, `SpecimenReminder`, theme types |
| `src/care/` | Care selectors, the care service (record, skip, snooze), and local date rollover |
| `src/storage/` | Store contracts, local store, and a Supabase-backed store (`storage/supabase/`) with sync |
| `src/auth/` | Supabase auth provider and the collection session coordinator (local vs cloud conflict) |
| `src/sharing/` | Share tokens and loading shared collections |
| `src/lib/` | Search, filter, sort, date, reminder, and theme helpers |
| `src/validation/` | Specimen and reminder validation |
| `supabase/migrations/` | SQL migrations: schema, RLS, RPCs, care history, sharing |

## Infrastructure

| Concern | Tool |
|---|---|
| Version control | GitHub — `nmheinrich/verdarium` (**public**) |
| Hosting | Vercel (Hobby), project `verdarium`, live at https://verdarium-neon.vercel.app. PR branches get preview deploys and `main` deploys to production |
| Database, auth | Supabase (Free), project `verdarium`, region Americas |
| Provisioning and credentials | Stripe Projects (`stripe projects status`, `stripe projects env`, `stripe projects env --pull`) |

### Environment variables

- The frontend reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, and both must be set in Vercel.
- The Stripe Projects `.env` provides `SUPABASE_*` and `VERCEL_*` values. In Vercel, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` were added manually, mapped from `SUPABASE_PROJECT_URL` and `SUPABASE_PUBLISHABLE_KEY`. If Supabase credentials are rotated, update those two Vercel variables too.
- Never commit `.env*` (the only exception is `.env.example`) or `.projects/vault`.

### Project skills

- `stripe-projects-cli`: provisioning, credentials, and upgrades
- `sp-supabase`: Supabase guidance
- `sp-vercel`: Vercel CLI with tokens. Deploy previews only unless production is explicitly requested.
