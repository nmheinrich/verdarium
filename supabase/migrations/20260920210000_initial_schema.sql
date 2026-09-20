-- Verdarium Feature 101 — Initial Supabase schema
-- Creates the private cloud collection model used by authenticated users.
--
-- V1 compatibility notes:
-- - Specimen IDs remain TEXT because existing local IDs are not guaranteed
--   to be UUIDs.
-- - classification, location, and reminder remain JSONB so the Supabase
--   schema does not over-normalize established Verdarium domain objects.
-- - Public/anonymous collection access is intentionally not enabled.

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.specimens (
  id text primary key,
  collection_id uuid not null references public.collections(id) on delete cascade,

  common_name text not null,
  scientific_name text not null,

  classification jsonb not null,
  location jsonb,

  health_status text not null,
  light_preference text,

  acquisition_date date,
  acquisition_source text,

  notes text,
  tags text[] not null default '{}'::text[],

  illustration_key text,
  reminder jsonb,

  is_favorite boolean not null default false,

  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index specimens_collection_id_idx
  on public.specimens(collection_id);

create index specimens_collection_updated_at_idx
  on public.specimens(collection_id, updated_at desc);

alter table public.collections enable row level security;
alter table public.specimens enable row level security;

-- Start private by default.
-- Signed-out browser clients should not read or mutate cloud collection data.
revoke all on table public.collections from anon;
revoke all on table public.specimens from anon;

-- Authenticated users may perform normal CRUD operations, but RLS policies
-- below determine which rows they are actually allowed to access.
revoke all on table public.collections from authenticated;
revoke all on table public.specimens from authenticated;

grant select, insert, update, delete
  on table public.collections
  to authenticated;

grant select, insert, update, delete
  on table public.specimens
  to authenticated;

-- Collections ---------------------------------------------------------------

create policy "Users can view their own collections"
  on public.collections
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
  );

create policy "Users can create their own collections"
  on public.collections
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
  );

create policy "Users can update their own collections"
  on public.collections
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
  )
  with check (
    owner_id = (select auth.uid())
  );

create policy "Users can delete their own collections"
  on public.collections
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
  );

-- Specimens ----------------------------------------------------------------

create policy "Users can view specimens in their own collections"
  on public.specimens
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.collections
      where collections.id = specimens.collection_id
        and collections.owner_id = (select auth.uid())
    )
  );

create policy "Users can create specimens in their own collections"
  on public.specimens
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.collections
      where collections.id = specimens.collection_id
        and collections.owner_id = (select auth.uid())
    )
  );

create policy "Users can update specimens in their own collections"
  on public.specimens
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.collections
      where collections.id = specimens.collection_id
        and collections.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.collections
      where collections.id = specimens.collection_id
        and collections.owner_id = (select auth.uid())
    )
  );

create policy "Users can delete specimens in their own collections"
  on public.specimens
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.collections
      where collections.id = specimens.collection_id
        and collections.owner_id = (select auth.uid())
    )
  );