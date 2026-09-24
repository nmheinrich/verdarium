-- Optional care note on record_specimen_care (spec 001).
--
-- Adds p_note (text, up to 140 characters, default null), stored as
-- care_events.metadata.note. Existing three-argument calls keep working
-- because the new parameter has a default. The old signature is dropped so
-- PostgREST has a single, unambiguous candidate.

drop function if exists public.record_specimen_care(
  uuid,
  text,
  date
);

create function public.record_specimen_care(
  p_action_id uuid,
  p_specimen_id text,
  p_completed_at date,
  p_note text default null
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
  v_note text;
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

  v_note := nullif(btrim(p_note), '');

  if v_note is not null
    and char_length(v_note) > 140 then
    raise exception
      'Care note must be 140 characters or fewer.';
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
    next_due_at,
    metadata
  )
  values (
    p_action_id,
    v_collection_id,
    p_specimen_id,
    'care_completed',
    v_scheduled_for,
    v_next_due_at,
    case
      when v_note is null then '{}'::jsonb
      else jsonb_build_object('note', v_note)
    end
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

revoke execute
  on function public.record_specimen_care(
    uuid,
    text,
    date,
    text
  )
  from public;

revoke execute
  on function public.record_specimen_care(
    uuid,
    text,
    date,
    text
  )
  from anon;

grant execute
  on function public.record_specimen_care(
    uuid,
    text,
    date,
    text
  )
  to authenticated;
