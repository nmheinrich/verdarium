begin;

revoke execute
  on function public.set_specimen_care_reminder(
    uuid,
    text,
    integer,
    text,
    date
  )
  from anon;

revoke execute
  on function public.record_specimen_care(
    uuid,
    text,
    date
  )
  from anon;

revoke execute
  on function public.snooze_specimen_care(
    uuid,
    text,
    date
  )
  from anon;

revoke execute
  on function public.skip_specimen_care(
    uuid,
    text
  )
  from anon;

revoke execute
  on function public.set_specimen_care_reminder_enabled(
    uuid,
    text,
    boolean,
    date
  )
  from anon;


revoke execute
  on function public.set_specimen_care_reminder(
    uuid,
    text,
    integer,
    text,
    date
  )
  from public;

revoke execute
  on function public.record_specimen_care(
    uuid,
    text,
    date
  )
  from public;

revoke execute
  on function public.snooze_specimen_care(
    uuid,
    text,
    date
  )
  from public;

revoke execute
  on function public.skip_specimen_care(
    uuid,
    text
  )
  from public;

revoke execute
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