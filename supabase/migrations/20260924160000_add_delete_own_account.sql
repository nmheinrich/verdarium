-- Self-service account deletion.
--
-- Adds an RPC, delete_own_account(), that a signed-in user calls to
-- permanently delete their own auth.users row and everything derived from
-- it. There is no soft delete and no grace period: this is immediate and
-- irreversible, by product decision (2026-09-24).
--
-- ---------------------------------------------------------------------------
-- Why a Postgres RPC instead of an Edge Function
-- ---------------------------------------------------------------------------
-- Deleting a Supabase auth user is normally done with the service-role
-- key (supabase.auth.admin.deleteUser), which the browser must never hold.
-- The usual way around that without standing up separate serverless
-- infrastructure (this project has none: no supabase/functions, no
-- service-role secret in Vercel) is a `security definer` Postgres function
-- that deletes the caller's own row from auth.users. Migrations in this
-- project run as the `postgres` role (via `supabase db push`, see
-- routines/supabase-migration-check.md), and that role has the grants
-- needed on the `auth` schema in a Supabase-hosted project. The function
-- below is owned by whichever role runs the migration, so it inherits
-- those grants; it does not attempt to escalate anything itself.
--
-- If, when this is applied, the `delete from auth.users` line below fails
-- with a permissions error, the project's Postgres role does not have the
-- expected grant on `auth.users` and this approach does not work as
-- written. The fallback is a Supabase Edge Function using the service-role
-- key to call `supabase.auth.admin.deleteUser(id)`, which is new
-- infrastructure for this repo (see context/stack.md) and was intentionally
-- not chosen first.
--
-- ---------------------------------------------------------------------------
-- What gets deleted, and why nothing else needs to be touched here
-- ---------------------------------------------------------------------------
-- deleting from auth.users cascades, entirely through existing foreign
-- keys already in this schema:
--
--   auth.users
--     -> public.collections            (owner_id, on delete cascade;
--                                        20260920210000_initial_schema.sql)
--       -> public.specimens            (collection_id, on delete cascade)
--       -> public.care_events          (collection_id, on delete cascade;
--                                        20260922011500_add_care_history.sql)
--
-- Sharing state (sharing_enabled, share_token, shared_title,
-- shared_description, shared_at) is columns on public.collections itself
-- (20260922001500_add_collection_sharing.sql), not a separate table, so it
-- is removed with the collection row. A shared link built from that token
-- stops resolving the moment the collection is gone — immediately, not on
-- a delay. This function does not need to touch collections, specimens,
-- care_events, or sharing columns directly: one delete on auth.users is
-- enough.
--
-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------
-- No parameters: it only ever deletes auth.uid(), the caller's own row.
-- There is no code path for deleting another user's account.
-- Grants follow the pattern in 20260922014500_restrict_care_rpc_permissions.sql:
-- revoked from anon and public, granted to authenticated only.

create function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception
      'Authentication is required to delete an account.';
  end if;

  -- Cascades through collections -> specimens -> care_events (and the
  -- sharing columns on collections) as documented above.
  delete from auth.users
  where id = v_user_id;
end;
$$;

revoke execute
  on function public.delete_own_account()
  from anon;

revoke execute
  on function public.delete_own_account()
  from public;

grant execute
  on function public.delete_own_account()
  to authenticated;
