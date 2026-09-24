# Review

How work gets reviewed before it reaches `main`, which is production on Vercel.

## Flow

1. Branch from `main` as `feat/…`, `fix/…`, `chore/…`, or `docs/…`.
2. Work against a spec in `specs/`. Skip the spec only for small fixes.
3. Run `routines/pre-deploy-check.md`. If the PR includes a migration, also run `routines/supabase-migration-check.md`.
4. Push and open a PR using the description template below.
5. Heinrich reviews the Vercel preview deploy and merges. Claude never merges to or pushes `main`.

## Definition of done

- [ ] `npm run lint` and `npm run build` pass
- [ ] The change was checked in the browser: the happy path plus one edge case (empty collection, overdue care, signed out)
- [ ] It looks right in **Archive, Herbarium, and Night Archive**, at desktop and around 375px mobile width
- [ ] It works signed out (local collection) and signed in (cloud sync), where relevant
- [ ] Tokens and `components/ui` primitives are used; there are no hardcoded colors or one-off buttons
- [ ] Motion respects reduced-motion settings
- [ ] Copy matches the voice in `context/brand-and-design.md`
- [ ] No secrets or customer data are in the diff (the repo is public)
- [ ] `ROADMAP.md` and the relevant spec status are updated

## Product lens (ask every time)

- **Collection first:** does this make the collection feel more like an archive, or more like a task list?
- **Calm:** does anything shout? Red badges, counters, exclamation marks, and nagging all count.
- **Structure:** is specimen data stored as structured fields instead of free text where that matters?
- **Coherence:** would a collector see this as part of the same object or museum catalog?

## Code lens

- Keep types in `src/types`, pure logic in `src/lib` or `src/care`, and persistence behind `src/storage` contracts. Components shouldn't talk to Supabase directly.
- Local and cloud stores must stay behaviourally identical.
- Dates: use the local-date helpers (`src/lib/date.ts`, `useLocalDateRollover`) and avoid naive UTC math for "today".
- Validate at the edges with `src/validation`.

## Supabase lens

- New tables have RLS enabled, with policies scoped to the owner or collaborator.
- RPCs use `security definer` only when needed, with explicit `grant execute` and no grants to `anon` unless intended.
- Migrations only add; applied migrations are never edited.

## PR description template

```markdown
## What
<one or two sentences>

## Why
<link to spec / roadmap item>

## How to verify
- Preview URL:
- Steps:

## Checklist
- [ ] Lint and build pass
- [ ] Themes and mobile checked
- [ ] Migration check (if applicable)
- [ ] ROADMAP/spec updated
```
