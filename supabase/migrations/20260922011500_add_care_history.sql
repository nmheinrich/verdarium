-- Verdarium Feature 104 — Care and reminder history
--
-- Adds:
--   - append-only care_events history
--   - owner-only care-event reads
--   - atomic reminder configuration
--   - atomic care completion
--   - atomic snooze
--   - atomic skip
--   - atomic enable / disable
--   - client-generated action UUID idempotency
--
-- Reminder configuration remains stored on specimens.reminder.
-- Historical actions live separately in care_events.
--
-- Anonymous users receive no access to care history.

begin;


-- ---------------------------------------------------------------------------
-- Care event ledger
-- ---------------------------------------------------------------------------

create table public.care_events (
  id uuid primary key,

  collection_id uuid not null
    references public.collections(id)
    on delete cascade,

  specimen_id text not null,

  event_type text not null
    check (
      event_type in (
        'care_completed',
        'reminder_snoozed',
        'reminder_skipped',
        'reminder_created',
        'reminder_updated',
        'reminder_enabled',
        'reminder_disabled'
      )
    ),

  scheduled_for date,

  occurred_at timestamptz not null
    default now(),

  next_due_at date,

  metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now()
);

create index care_events_collection_specimen_occurred_idx
  on public.care_events (
    collection_id,
    specimen_id,
    occurred_at desc
  );


-- ---------------------------------------------------------------------------
-- Permissions and RLS
-- ---------------------------------------------------------------------------

alter table public.care_events
  enable row level security;

revoke all
  on table public.care_events
  from anon;

revoke all
  on table public.care_events
  from authenticated;

grant select
  on table public.care_events
  to authenticated;

create policy "owners can read care events"
  on public.care_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.collections
      where collections.id =
        care_events.collection_id
        and collections.owner_id =
          (select auth.uid())
    )
  );


-- ---------------------------------------------------------------------------
-- Internal recurrence helper
-- ---------------------------------------------------------------------------

create or replace function public.care_add_frequency(
  p_date date,
  p_interval integer,
  p_unit text
)
returns date
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_interval <= 0 then
    raise exception
      'Care reminder interval must be greater than zero.';
  end if;

  case p_unit
    when 'day' then
      return (
        p_date +
        make_interval(days => p_interval)
      )::date;

    when 'week' then
      return (
        p_date +
        make_interval(weeks => p_interval)
      )::date;

    when 'month' then
      return (
        p_date +
        make_interval(months => p_interval)
      )::date;

    else
      raise exception
        'Unsupported care reminder frequency unit.';
  end case;
end;
$$;

revoke all
  on function public.care_add_frequency(
    date,
    integer,
    text
  )
  from public;


-- ---------------------------------------------------------------------------
-- Configure or edit a recurring care reminder
-- ---------------------------------------------------------------------------

create or replace function public.set_specimen_care_reminder(
  p_action_id uuid,
  p_specimen_id text,
  p_interval integer,
  p_unit text,
  p_next_due_at date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_reminder jsonb;
  v_new_reminder jsonb;
  v_existing_event public.care_events;
  v_event public.care_events;
  v_event_type text;
  v_enabled boolean;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception
      'Authentication is required to manage care reminders.';
  end if;

  if p_action_id is null then
    raise exception
      'Care action id is required.';
  end if;

  if p_interval <= 0 then
    raise exception
      'Care reminder interval must be greater than zero.';
  end if;

  if p_unit not in ('day', 'week', 'month') then
    raise exception
      'Unsupported care reminder frequency unit.';
  end if;

  if p_next_due_at is null then
    raise exception
      'Next care date is required.';
  end if;

  select
    specimen.collection_id,
    coalesce(
      specimen.reminder,
      '{}'::jsonb
    )
  into
    v_collection_id,
    v_reminder
  from public.specimens as specimen
  join public.collections as collection
    on collection.id =
      specimen.collection_id
  where specimen.id =
      p_specimen_id
    and collection.owner_id =
      v_owner_id
  for update of specimen;

  if v_collection_id is null then
    raise exception
      'Specimen not found or access denied.';
  end if;

  select *
  into v_existing_event
  from public.care_events
  where id = p_action_id;

  if found then
    if (
      v_existing_event.collection_id <>
        v_collection_id
      or v_existing_event.specimen_id <>
        p_specimen_id
      or v_existing_event.event_type not in (
        'reminder_created',
        'reminder_updated'
      )
    ) then
      raise exception
        'Care action id has already been used.';
    end if;

    return jsonb_build_object(
      'reminder',
      v_reminder,
      'event',
      jsonb_build_object(
        'id',
          v_existing_event.id,
        'specimenId',
          v_existing_event.specimen_id,
        'eventType',
          v_existing_event.event_type,
        'scheduledFor',
          v_existing_event.scheduled_for,
        'occurredAt',
          v_existing_event.occurred_at,
        'nextDueAt',
          v_existing_event.next_due_at,
        'metadata',
          v_existing_event.metadata
      )
    );
  end if;

  if (
    v_reminder ? 'frequency'
    and v_reminder ? 'nextDueAt'
  ) then
    v_event_type := 'reminder_updated';
  else
    v_event_type := 'reminder_created';
  end if;

  v_enabled :=
    case
      when jsonb_typeof(
        v_reminder -> 'enabled'
      ) = 'boolean'
      then (
        v_reminder ->> 'enabled'
      )::boolean
      else true
    end;

  v_new_reminder :=
    jsonb_strip_nulls(
      jsonb_build_object(
        'enabled',
          v_enabled,
        'frequency',
          jsonb_build_object(
            'interval',
              p_interval,
            'unit',
              p_unit
          ),
        'lastCompletedAt',
          v_reminder ->
            'lastCompletedAt',
        'nextDueAt',
          to_char(
            p_next_due_at,
            'YYYY-MM-DD'
          )
      )
    );

  update public.specimens
  set
    reminder = v_new_reminder,
    updated_at = now()
  where id = p_specimen_id
    and collection_id =
      v_collection_id;

  insert into public.care_events (
    id,
    collection_id,
    specimen_id,
    event_type,
    scheduled_for,
    next_due_at,
    metadata
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    v_event_type,
    p_next_due_at,
    p_next_due_at,
    jsonb_build_object(
      'frequency',
        jsonb_build_object(
          'interval',
            p_interval,
          'unit',
            p_unit
        )
    )
  )
  returning *
  into v_event;

  return jsonb_build_object(
    'reminder',
      v_new_reminder,
    'event',
      jsonb_build_object(
        'id',
          v_event.id,
        'specimenId',
          v_event.specimen_id,
        'eventType',
          v_event.event_type,
        'scheduledFor',
          v_event.scheduled_for,
        'occurredAt',
          v_event.occurred_at,
        'nextDueAt',
          v_event.next_due_at,
        'metadata',
          v_event.metadata
      )
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- Record care completion
-- ---------------------------------------------------------------------------

create or replace function public.record_specimen_care(
  p_action_id uuid,
  p_specimen_id text,
  p_completed_at date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_reminder jsonb;
  v_new_reminder jsonb;
  v_existing_event public.care_events;
  v_event public.care_events;
  v_interval integer;
  v_unit text;
  v_scheduled_for date;
  v_next_due_at date;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception
      'Authentication is required to record care.';
  end if;

  if p_action_id is null then
    raise exception
      'Care action id is required.';
  end if;

  if p_completed_at is null then
    raise exception
      'Care completion date is required.';
  end if;

  select
    specimen.collection_id,
    coalesce(
      specimen.reminder,
      '{}'::jsonb
    )
  into
    v_collection_id,
    v_reminder
  from public.specimens as specimen
  join public.collections as collection
    on collection.id =
      specimen.collection_id
  where specimen.id =
      p_specimen_id
    and collection.owner_id =
      v_owner_id
  for update of specimen;

  if v_collection_id is null then
    raise exception
      'Specimen not found or access denied.';
  end if;

  select *
  into v_existing_event
  from public.care_events
  where id = p_action_id;

  if found then
    if (
      v_existing_event.collection_id <>
        v_collection_id
      or v_existing_event.specimen_id <>
        p_specimen_id
      or v_existing_event.event_type <>
        'care_completed'
    ) then
      raise exception
        'Care action id has already been used.';
    end if;

    return jsonb_build_object(
      'reminder',
        v_reminder,
      'event',
        jsonb_build_object(
          'id',
            v_existing_event.id,
          'specimenId',
            v_existing_event.specimen_id,
          'eventType',
            v_existing_event.event_type,
          'scheduledFor',
            v_existing_event.scheduled_for,
          'occurredAt',
            v_existing_event.occurred_at,
          'nextDueAt',
            v_existing_event.next_due_at,
          'metadata',
            v_existing_event.metadata
        )
    );
  end if;

  if (
    coalesce(
      v_reminder ->> 'enabled',
      'false'
    ) <> 'true'
  ) then
    raise exception
      'This specimen does not have an enabled care reminder.';
  end if;

  if coalesce(
    v_reminder #>>
      '{frequency,interval}',
    ''
  ) !~ '^[1-9][0-9]*$' then
    raise exception
      'Care reminder frequency is invalid.';
  end if;

  v_interval :=
    (
      v_reminder #>>
        '{frequency,interval}'
    )::integer;

  v_unit :=
    v_reminder #>>
      '{frequency,unit}';

  if v_unit not in (
    'day',
    'week',
    'month'
  ) then
    raise exception
      'Care reminder frequency is invalid.';
  end if;

  if coalesce(
    v_reminder ->> 'nextDueAt',
    ''
  ) = '' then
    raise exception
      'Care reminder has no next care date.';
  end if;

  v_scheduled_for :=
    (
      v_reminder ->>
        'nextDueAt'
    )::date;

  v_next_due_at :=
    public.care_add_frequency(
      p_completed_at,
      v_interval,
      v_unit
    );

  v_new_reminder :=
    jsonb_strip_nulls(
      jsonb_build_object(
        'enabled',
          true,
        'frequency',
          jsonb_build_object(
            'interval',
              v_interval,
            'unit',
              v_unit
          ),
        'lastCompletedAt',
          to_char(
            p_completed_at,
            'YYYY-MM-DD'
          ),
        'nextDueAt',
          to_char(
            v_next_due_at,
            'YYYY-MM-DD'
          )
      )
    );

  update public.specimens
  set
    reminder = v_new_reminder,
    updated_at = now()
  where id = p_specimen_id
    and collection_id =
      v_collection_id;

  insert into public.care_events (
    id,
    collection_id,
    specimen_id,
    event_type,
    scheduled_for,
    next_due_at
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    'care_completed',
    v_scheduled_for,
    v_next_due_at
  )
  returning *
  into v_event;

  return jsonb_build_object(
    'reminder',
      v_new_reminder,
    'event',
      jsonb_build_object(
        'id',
          v_event.id,
        'specimenId',
          v_event.specimen_id,
        'eventType',
          v_event.event_type,
        'scheduledFor',
          v_event.scheduled_for,
        'occurredAt',
          v_event.occurred_at,
        'nextDueAt',
          v_event.next_due_at,
        'metadata',
          v_event.metadata
      )
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- Snooze current care occurrence
-- ---------------------------------------------------------------------------

create or replace function public.snooze_specimen_care(
  p_action_id uuid,
  p_specimen_id text,
  p_snoozed_until date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_reminder jsonb;
  v_new_reminder jsonb;
  v_existing_event public.care_events;
  v_event public.care_events;
  v_scheduled_for date;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception
      'Authentication is required to snooze care.';
  end if;

  if p_action_id is null then
    raise exception
      'Care action id is required.';
  end if;

  if p_snoozed_until is null then
    raise exception
      'Snooze date is required.';
  end if;

  select
    specimen.collection_id,
    coalesce(
      specimen.reminder,
      '{}'::jsonb
    )
  into
    v_collection_id,
    v_reminder
  from public.specimens as specimen
  join public.collections as collection
    on collection.id =
      specimen.collection_id
  where specimen.id =
      p_specimen_id
    and collection.owner_id =
      v_owner_id
  for update of specimen;

  if v_collection_id is null then
    raise exception
      'Specimen not found or access denied.';
  end if;

  select *
  into v_existing_event
  from public.care_events
  where id = p_action_id;

  if found then
    if (
      v_existing_event.collection_id <>
        v_collection_id
      or v_existing_event.specimen_id <>
        p_specimen_id
      or v_existing_event.event_type <>
        'reminder_snoozed'
    ) then
      raise exception
        'Care action id has already been used.';
    end if;

    return jsonb_build_object(
      'reminder',
        v_reminder,
      'event',
        jsonb_build_object(
          'id',
            v_existing_event.id,
          'specimenId',
            v_existing_event.specimen_id,
          'eventType',
            v_existing_event.event_type,
          'scheduledFor',
            v_existing_event.scheduled_for,
          'occurredAt',
            v_existing_event.occurred_at,
          'nextDueAt',
            v_existing_event.next_due_at,
          'metadata',
            v_existing_event.metadata
        )
    );
  end if;

  if (
    coalesce(
      v_reminder ->> 'enabled',
      'false'
    ) <> 'true'
  ) then
    raise exception
      'This specimen does not have an enabled care reminder.';
  end if;

  if coalesce(
    v_reminder ->> 'nextDueAt',
    ''
  ) = '' then
    raise exception
      'Care reminder has no next care date.';
  end if;

  v_scheduled_for :=
    (
      v_reminder ->>
        'nextDueAt'
    )::date;

  if p_snoozed_until <= greatest(
    v_scheduled_for,
    current_date
  ) then
    raise exception
      'Snooze date must be later than the current effective care date.';
  end if;

  v_new_reminder :=
    v_reminder ||
    jsonb_build_object(
      'snoozedUntil',
        to_char(
          p_snoozed_until,
          'YYYY-MM-DD'
        )
    );

  update public.specimens
  set
    reminder = v_new_reminder,
    updated_at = now()
  where id = p_specimen_id
    and collection_id =
      v_collection_id;

  insert into public.care_events (
    id,
    collection_id,
    specimen_id,
    event_type,
    scheduled_for,
    next_due_at,
    metadata
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    'reminder_snoozed',
    v_scheduled_for,
    v_scheduled_for,
    jsonb_build_object(
      'snoozedUntil',
        to_char(
          p_snoozed_until,
          'YYYY-MM-DD'
        )
    )
  )
  returning *
  into v_event;

  return jsonb_build_object(
    'reminder',
      v_new_reminder,
    'event',
      jsonb_build_object(
        'id',
          v_event.id,
        'specimenId',
          v_event.specimen_id,
        'eventType',
          v_event.event_type,
        'scheduledFor',
          v_event.scheduled_for,
        'occurredAt',
          v_event.occurred_at,
        'nextDueAt',
          v_event.next_due_at,
        'metadata',
          v_event.metadata
      )
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- Skip current care occurrence
-- ---------------------------------------------------------------------------

create or replace function public.skip_specimen_care(
  p_action_id uuid,
  p_specimen_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_reminder jsonb;
  v_new_reminder jsonb;
  v_existing_event public.care_events;
  v_event public.care_events;
  v_interval integer;
  v_unit text;
  v_scheduled_for date;
  v_next_due_at date;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception
      'Authentication is required to skip care.';
  end if;

  if p_action_id is null then
    raise exception
      'Care action id is required.';
  end if;

  select
    specimen.collection_id,
    coalesce(
      specimen.reminder,
      '{}'::jsonb
    )
  into
    v_collection_id,
    v_reminder
  from public.specimens as specimen
  join public.collections as collection
    on collection.id =
      specimen.collection_id
  where specimen.id =
      p_specimen_id
    and collection.owner_id =
      v_owner_id
  for update of specimen;

  if v_collection_id is null then
    raise exception
      'Specimen not found or access denied.';
  end if;

  select *
  into v_existing_event
  from public.care_events
  where id = p_action_id;

  if found then
    if (
      v_existing_event.collection_id <>
        v_collection_id
      or v_existing_event.specimen_id <>
        p_specimen_id
      or v_existing_event.event_type <>
        'reminder_skipped'
    ) then
      raise exception
        'Care action id has already been used.';
    end if;

    return jsonb_build_object(
      'reminder',
        v_reminder,
      'event',
        jsonb_build_object(
          'id',
            v_existing_event.id,
          'specimenId',
            v_existing_event.specimen_id,
          'eventType',
            v_existing_event.event_type,
          'scheduledFor',
            v_existing_event.scheduled_for,
          'occurredAt',
            v_existing_event.occurred_at,
          'nextDueAt',
            v_existing_event.next_due_at,
          'metadata',
            v_existing_event.metadata
        )
    );
  end if;

  if (
    coalesce(
      v_reminder ->> 'enabled',
      'false'
    ) <> 'true'
  ) then
    raise exception
      'This specimen does not have an enabled care reminder.';
  end if;

  if coalesce(
    v_reminder #>>
      '{frequency,interval}',
    ''
  ) !~ '^[1-9][0-9]*$' then
    raise exception
      'Care reminder frequency is invalid.';
  end if;

  v_interval :=
    (
      v_reminder #>>
        '{frequency,interval}'
    )::integer;

  v_unit :=
    v_reminder #>>
      '{frequency,unit}';

  if v_unit not in (
    'day',
    'week',
    'month'
  ) then
    raise exception
      'Care reminder frequency is invalid.';
  end if;

  if coalesce(
    v_reminder ->> 'nextDueAt',
    ''
  ) = '' then
    raise exception
      'Care reminder has no next care date.';
  end if;

  v_scheduled_for :=
    (
      v_reminder ->>
        'nextDueAt'
    )::date;

  v_next_due_at :=
    public.care_add_frequency(
      v_scheduled_for,
      v_interval,
      v_unit
    );

  v_new_reminder :=
    jsonb_strip_nulls(
      jsonb_build_object(
        'enabled',
          true,
        'frequency',
          jsonb_build_object(
            'interval',
              v_interval,
            'unit',
              v_unit
          ),
        'lastCompletedAt',
          v_reminder ->
            'lastCompletedAt',
        'nextDueAt',
          to_char(
            v_next_due_at,
            'YYYY-MM-DD'
          )
      )
    );

  update public.specimens
  set
    reminder = v_new_reminder,
    updated_at = now()
  where id = p_specimen_id
    and collection_id =
      v_collection_id;

  insert into public.care_events (
    id,
    collection_id,
    specimen_id,
    event_type,
    scheduled_for,
    next_due_at
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    'reminder_skipped',
    v_scheduled_for,
    v_next_due_at
  )
  returning *
  into v_event;

  return jsonb_build_object(
    'reminder',
      v_new_reminder,
    'event',
      jsonb_build_object(
        'id',
          v_event.id,
        'specimenId',
          v_event.specimen_id,
        'eventType',
          v_event.event_type,
        'scheduledFor',
          v_event.scheduled_for,
        'occurredAt',
          v_event.occurred_at,
        'nextDueAt',
          v_event.next_due_at,
        'metadata',
          v_event.metadata
      )
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- Enable or disable an existing reminder
-- ---------------------------------------------------------------------------

create or replace function public.set_specimen_care_reminder_enabled(
  p_action_id uuid,
  p_specimen_id text,
  p_enabled boolean,
  p_next_due_at date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_collection_id uuid;
  v_reminder jsonb;
  v_new_reminder jsonb;
  v_existing_event public.care_events;
  v_event public.care_events;
  v_event_type text;
  v_stored_next_due_at date;
  v_effective_next_due_at date;
begin
  v_owner_id := (select auth.uid());

  if v_owner_id is null then
    raise exception
      'Authentication is required to manage care reminders.';
  end if;

  if p_action_id is null then
    raise exception
      'Care action id is required.';
  end if;

  select
    specimen.collection_id,
    coalesce(
      specimen.reminder,
      '{}'::jsonb
    )
  into
    v_collection_id,
    v_reminder
  from public.specimens as specimen
  join public.collections as collection
    on collection.id =
      specimen.collection_id
  where specimen.id =
      p_specimen_id
    and collection.owner_id =
      v_owner_id
  for update of specimen;

  if v_collection_id is null then
    raise exception
      'Specimen not found or access denied.';
  end if;

  select *
  into v_existing_event
  from public.care_events
  where id = p_action_id;

  if found then
    if (
      v_existing_event.collection_id <>
        v_collection_id
      or v_existing_event.specimen_id <>
        p_specimen_id
      or v_existing_event.event_type not in (
        'reminder_enabled',
        'reminder_disabled'
      )
    ) then
      raise exception
        'Care action id has already been used.';
    end if;

    return jsonb_build_object(
      'reminder',
        v_reminder,
      'event',
        jsonb_build_object(
          'id',
            v_existing_event.id,
          'specimenId',
            v_existing_event.specimen_id,
          'eventType',
            v_existing_event.event_type,
          'scheduledFor',
            v_existing_event.scheduled_for,
          'occurredAt',
            v_existing_event.occurred_at,
          'nextDueAt',
            v_existing_event.next_due_at,
          'metadata',
            v_existing_event.metadata
        )
    );
  end if;

  if not (
    v_reminder ? 'frequency'
  ) then
    raise exception
      'Configure a care reminder before enabling or disabling it.';
  end if;

  if coalesce(
    v_reminder ->> 'nextDueAt',
    ''
  ) <> '' then
    v_stored_next_due_at :=
      (
        v_reminder ->>
          'nextDueAt'
      )::date;
  end if;

  if p_enabled then
    if p_next_due_at is not null then
      v_effective_next_due_at :=
        p_next_due_at;
    elsif (
      v_stored_next_due_at is not null
      and
      v_stored_next_due_at >=
        current_date
    ) then
      v_effective_next_due_at :=
        v_stored_next_due_at;
    else
      raise exception
        'Choose a new next care date before re-enabling this reminder.';
    end if;

    v_new_reminder :=
      jsonb_strip_nulls(
        jsonb_build_object(
          'enabled',
            true,
          'frequency',
            v_reminder ->
              'frequency',
          'lastCompletedAt',
            v_reminder ->
              'lastCompletedAt',
          'nextDueAt',
            to_char(
              v_effective_next_due_at,
              'YYYY-MM-DD'
            )
        )
      );

    v_event_type :=
      'reminder_enabled';
  else
    v_new_reminder :=
      jsonb_strip_nulls(
        jsonb_build_object(
          'enabled',
            false,
          'frequency',
            v_reminder ->
              'frequency',
          'lastCompletedAt',
            v_reminder ->
              'lastCompletedAt',
          'nextDueAt',
            v_reminder ->
              'nextDueAt'
        )
      );

    v_effective_next_due_at :=
      v_stored_next_due_at;

    v_event_type :=
      'reminder_disabled';
  end if;

  update public.specimens
  set
    reminder = v_new_reminder,
    updated_at = now()
  where id = p_specimen_id
    and collection_id =
      v_collection_id;

  insert into public.care_events (
    id,
    collection_id,
    specimen_id,
    event_type,
    scheduled_for,
    next_due_at
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    v_event_type,
    v_stored_next_due_at,
    v_effective_next_due_at
  )
  returning *
  into v_event;

  return jsonb_build_object(
    'reminder',
      v_new_reminder,
    'event',
      jsonb_build_object(
        'id',
          v_event.id,
        'specimenId',
          v_event.specimen_id,
        'eventType',
          v_event.event_type,
        'scheduledFor',
          v_event.scheduled_for,
        'occurredAt',
          v_event.occurred_at,
        'nextDueAt',
          v_event.next_due_at,
        'metadata',
          v_event.metadata
      )
  );
end;
$$;


-- ---------------------------------------------------------------------------
-- RPC permissions
-- ---------------------------------------------------------------------------

revoke all
  on function public.set_specimen_care_reminder(
    uuid,
    text,
    integer,
    text,
    date
  )
  from public;

revoke all
  on function public.record_specimen_care(
    uuid,
    text,
    date
  )
  from public;

revoke all
  on function public.snooze_specimen_care(
    uuid,
    text,
    date
  )
  from public;

revoke all
  on function public.skip_specimen_care(
    uuid,
    text
  )
  from public;

revoke all
  on function public.set_specimen_care_reminder_enabled(
    uuid,
    text,
    boolean,
    date
  )
  from public;


grant execute
  on function public.set_specimen_care_reminder(
    uuid,
    text,
    integer,
    text,
    date
  )
  to authenticated;

grant execute
  on function public.record_specimen_care(
    uuid,
    text,
    date
  )
  to authenticated;

grant execute
  on function public.snooze_specimen_care(
    uuid,
    text,
    date
  )
  to authenticated;

grant execute
  on function public.skip_specimen_care(
    uuid,
    text
  )
  to authenticated;

grant execute
  on function public.set_specimen_care_reminder_enabled(
    uuid,
    text,
    boolean,
    date
  )
  to authenticated;

commit;