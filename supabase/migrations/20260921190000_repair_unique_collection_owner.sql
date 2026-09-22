-- Verdarium Feature 102 — Repair one-collection-per-user invariant
--
-- The previously recorded unique-owner migration was empty, which allowed
-- concurrent collection initialization to create more than one collection
-- for the same authenticated user.
--
-- This repair:
-- 1. Selects each owner's earliest collection as the canonical collection.
-- 2. Moves specimens from duplicate collections into the canonical one.
-- 3. Deletes the now-empty duplicate collections.
-- 4. Enforces one collection per owner at the database level.

begin;

lock table public.collections in access exclusive mode;
lock table public.specimens in access exclusive mode;

with ranked_collections as (
  select
    id,
    owner_id,
    first_value(id) over (
      partition by owner_id
      order by created_at asc, id asc
    ) as canonical_collection_id,
    row_number() over (
      partition by owner_id
      order by created_at asc, id asc
    ) as collection_rank
  from public.collections
),
duplicate_collections as (
  select
    id as duplicate_collection_id,
    canonical_collection_id
  from ranked_collections
  where collection_rank > 1
)
update public.specimens as specimen
set collection_id =
  duplicate_collections.canonical_collection_id
from duplicate_collections
where specimen.collection_id =
  duplicate_collections.duplicate_collection_id;

with ranked_collections as (
  select
    id,
    row_number() over (
      partition by owner_id
      order by created_at asc, id asc
    ) as collection_rank
  from public.collections
)
delete from public.collections as collection
using ranked_collections
where collection.id = ranked_collections.id
  and ranked_collections.collection_rank > 1;

alter table public.collections
  add constraint collections_owner_id_key
  unique (owner_id);

commit;