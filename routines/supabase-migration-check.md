# Supabase migration check

**When:** on every PR that touches `supabase/migrations/`, plus a monthly health pass.

## Per-migration PR

- [ ] A new file named `supabase/migrations/YYYYMMDDHHMMSS_description.sql`. No existing migration was edited.
- [ ] The migration is additive and safe on existing data (defaults for new non-null columns, no destructive drops without a plan)
- [ ] New tables use `enable row level security`, with policies scoped to the owner or collaborator
- [ ] New functions: `security definer` only if needed, `set search_path`, explicit `grant execute` to `authenticated` only, and revoked from `public` and `anon` unless intended (follow the pattern in `20260922014500_restrict_care_rpc_permissions.sql`)
- [ ] App code handles both the old and new schema during rollout, or the migration is applied before the code merges
- [ ] `src/storage/supabase/` mappers and types are updated, and local store parity is kept
- [ ] Tested locally if possible (`npx supabase start` then `npx supabase db reset`)

## Applying to production

Only with Heinrich's explicit go-ahead:

1. Get credentials with `stripe projects env` (use `--pull` if `.env` is stale).
2. Check the pending migrations: `npx supabase migration list --db-url "$SUPABASE_DB_URL"`.
3. Apply them: `npx supabase db push --db-url "$SUPABASE_DB_URL"`.
4. Confirm the app works on production.

## Monthly health pass

- [ ] `npx supabase migration list` shows local and remote in sync
- [ ] Check for drift with `npx supabase db diff` against the linked project; it should show no unexpected changes
- [ ] Review the Security and Performance Advisors in the Supabase dashboard
- [ ] Check free-plan usage (database size, auth MAU) against the limits, and note it in the roadmap review if it's getting close

## Run log

| Date | Scope | Outcome |
|---|---|---|
