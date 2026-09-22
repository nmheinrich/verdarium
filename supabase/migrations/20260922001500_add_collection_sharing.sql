-- Verdarium Feature 103 — Collection sharing
--
-- Adds privacy-first, collection-level sharing to Verdarium.
--
-- Private collections remain protected by the existing owner-based RLS model.
-- Anonymous visitors do not receive direct SELECT access to collections or
-- specimens. Instead, public access is limited to an explicit, sanitized
-- projection returned by get_shared_collection().
--
-- Sharing uses an opaque UUID token:
--
--   sharing disabled
--     -> no public token
--
--   sharing enabled
--     -> one read-only token
--
--   sharing revoked
--     -> token removed immediately
--
--   sharing enabled again
--     -> a new token is generated
--
-- Private specimen fields such as location, acquisition source, notes,
-- reminders, and private timestamps are intentionally never returned by the
-- public sharing function.

begin;

alter table public.collections
  add column sharing_enabled boolean not null default false,
  add column share_token uuid,
  add column shared_title text,
  add column shared_description text,
  add column shared_at timestamptz;

alter table public.collections
  add constraint collections_shared_title_length_check
  check (
    shared_title is null
    or char_length(shared_title) <= 120
  );

alter table public.collections
  add constraint collections_shared_description_length_check
  check (
    shared_description is null
    or char_length(shared_description) <= 500
  );

alter table public.collections
  add constraint collections_sharing_state_check
  check (
    (
      sharing_enabled = true
      and share_token is not null
      and shared_at is not null
    )
    or
    (
      sharing_enabled = false
      and share_token is null
      and shared_at is null
    )
  );

create unique index collections_share_token_key
  on public.collections (share_token)
  where share_token is not null;


-- Owner-only mutation boundary.
--
-- Enabling sharing for the first time generates a token.
-- Updating public metadata while already shared preserves the current token.
-- Revoking sharing removes the token.
-- Re-enabling after revocation therefore generates a different token.
create or replace function public.set_collection_sharing(
  p_enabled boolean,
  p_shared_title text default null,
  p_shared_description text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_shared_title text;
  v_shared_description text;
  v_result public.collections;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception 'Authentication is required to manage collection sharing.';
  end if;

  v_shared_title := nullif(trim(p_shared_title), '');
  v_shared_description := nullif(trim(p_shared_description), '');

  if (
    v_shared_title is not null
    and char_length(v_shared_title) > 120
  ) then
    raise exception 'Shared collection title must be 120 characters or fewer.';
  end if;

  if (
    v_shared_description is not null
    and char_length(v_shared_description) > 500
  ) then
    raise exception 'Shared collection description must be 500 characters or fewer.';
  end if;

  select id
  into v_collection_id
  from public.collections
  where owner_id = v_owner_id
  for update;

  if v_collection_id is null then
    raise exception 'Collection not found or access denied.';
  end if;

  if p_enabled then
    update public.collections
    set
      sharing_enabled = true,
      share_token = case
        when sharing_enabled = true
          and share_token is not null
        then share_token
        else gen_random_uuid()
      end,
      shared_title = v_shared_title,
      shared_description = v_shared_description,
      shared_at = case
        when sharing_enabled = true
          and shared_at is not null
        then shared_at
        else now()
      end,
      updated_at = now()
    where id = v_collection_id
      and owner_id = v_owner_id
    returning *
    into v_result;
  else
    update public.collections
    set
      sharing_enabled = false,
      share_token = null,
      shared_at = null,
      updated_at = now()
    where id = v_collection_id
      and owner_id = v_owner_id
    returning *
    into v_result;
  end if;

  return jsonb_build_object(
    'enabled', v_result.sharing_enabled,
    'token', v_result.share_token,
    'title', v_result.shared_title,
    'description', v_result.shared_description,
    'sharedAt', v_result.shared_at
  );
end;
$$;

revoke all
  on function public.set_collection_sharing(boolean, text, text)
  from public;

revoke all
  on function public.set_collection_sharing(boolean, text, text)
  from anon;

grant execute
  on function public.set_collection_sharing(boolean, text, text)
  to authenticated;


-- Anonymous-safe read boundary.
--
-- SECURITY DEFINER is intentional here: anonymous visitors cannot SELECT the
-- private collections or specimens tables directly. This function bypasses
-- their RLS restrictions only long enough to construct the explicitly approved
-- public representation below.
--
-- Do not replace the explicit specimen projection with row_to_json(specimen)
-- or to_jsonb(specimen). New private database columns must never become public
-- automatically.
create or replace function public.get_shared_collection(
  p_share_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'title',
      collection.shared_title,
    'description',
      collection.shared_description,
    'sharedAt',
      collection.shared_at,
    'specimens',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id',
                specimen.id,
              'commonName',
                specimen.common_name,
              'scientificName',
                specimen.scientific_name,
              'classification',
                specimen.classification,
              'healthStatus',
                specimen.health_status,
              'lightPreference',
                specimen.light_preference,
              'tags',
                specimen.tags,
              'illustrationKey',
                specimen.illustration_key,
              'isFavorite',
                specimen.is_favorite
            )
            order by
              lower(specimen.common_name),
              specimen.id
          )
          from public.specimens as specimen
          where specimen.collection_id = collection.id
        ),
        '[]'::jsonb
      )
  )
  from public.collections as collection
  where collection.share_token = p_share_token
    and collection.sharing_enabled = true;
$$;

revoke all
  on function public.get_shared_collection(uuid)
  from public;

grant execute
  on function public.get_shared_collection(uuid)
  to anon;

grant execute
  on function public.get_shared_collection(uuid)
  to authenticated;

commit;