-- Verdarium Feature 101 — Atomic cloud collection replacement
--
-- Provides a transactional database function for replacing every specimen
-- in one authenticated user's collection.
--
-- This is intentionally implemented in PostgreSQL rather than as:
--
--   DELETE specimens
--   then
--   INSERT replacement specimens
--
-- from the browser. A database function ensures that either the entire
-- replacement succeeds or PostgreSQL rolls the operation back.

create or replace function public.replace_collection_specimens(
  p_collection_id uuid,
  p_specimens jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(p_specimens) <> 'array' then
    raise exception 'Replacement specimens must be a JSON array.';
  end if;

  if not exists (
    select 1
    from public.collections
    where id = p_collection_id
      and owner_id = (select auth.uid())
  ) then
    raise exception 'Collection not found or access denied.';
  end if;

  delete from public.specimens
  where collection_id = p_collection_id;

  insert into public.specimens (
    id,
    collection_id,
    common_name,
    scientific_name,
    classification,
    location,
    health_status,
    light_preference,
    acquisition_date,
    acquisition_source,
    notes,
    tags,
    illustration_key,
    reminder,
    is_favorite,
    created_at,
    updated_at
  )
  select
    specimen.id,
    p_collection_id,
    specimen.common_name,
    specimen.scientific_name,
    specimen.classification,
    specimen.location,
    specimen.health_status,
    specimen.light_preference,
    specimen.acquisition_date,
    specimen.acquisition_source,
    specimen.notes,
    coalesce(specimen.tags, '{}'::text[]),
    specimen.illustration_key,
    specimen.reminder,
    specimen.is_favorite,
    specimen.created_at,
    specimen.updated_at
  from jsonb_to_recordset(p_specimens) as specimen (
    id text,
    common_name text,
    scientific_name text,
    classification jsonb,
    location jsonb,
    health_status text,
    light_preference text,
    acquisition_date date,
    acquisition_source text,
    notes text,
    tags text[],
    illustration_key text,
    reminder jsonb,
    is_favorite boolean,
    created_at timestamptz,
    updated_at timestamptz
  );
end;
$$;

revoke all
  on function public.replace_collection_specimens(uuid, jsonb)
  from public;

revoke all
  on function public.replace_collection_specimens(uuid, jsonb)
  from anon;

grant execute
  on function public.replace_collection_specimens(uuid, jsonb)
  to authenticated;