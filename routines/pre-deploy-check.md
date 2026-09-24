# Pre-deploy check

**When:** before asking Heinrich to merge any PR into `main`, which deploys to production.

## Automated

```bash
npm ci
npm run lint
npm run build
git status --short
```

- [ ] Lint and build pass with no new warnings
- [ ] `git status` is clean, and no `.env*`, `.projects/vault`, or `customers/private/` files are staged
- [ ] `git diff main --stat` shows only intended files

## Secrets and data (public repo)

- [ ] No tokens, keys, or connection strings in the diff (`git diff main | grep -iE "key|token|secret|password"` and review hits)
- [ ] No customer names or emails, and no real collection data in the demo assets

## Preview verification

- [ ] The Vercel preview deploy for the branch built successfully (`vercel ls` or the PR checks)
- [ ] Smoke-test on the preview:
  - [ ] Signed out: add a specimen, edit it, search and filter
  - [ ] Signed in: sync works, care can be recorded, and history appears
  - [ ] Shared link (`/shared/:token`) loads
  - [ ] All three themes, desktop and mobile width
- [ ] No console errors

## Environment

- [ ] If Supabase credentials changed, the manually mapped `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel were updated
- [ ] If the PR contains a migration, run `supabase-migration-check.md` and confirm the migration is applied **before** merging code that depends on it

## After merge

- [ ] https://verdarium-neon.vercel.app loads, and sign-in works

## Run log

| Date | PR | Outcome |
|---|---|---|
| 2026-09-24 | #2 and the favicon/share fix | Full production smoke test. Add, edit, care (record, skip, snooze), history, search, filters, sort, themes, mobile and sign-out all pass. Found: share links 404 (fixed), no export in the UI, the snooze UX, the Care card overflow, scroll position |
