# 001 — Care on specimen tiles

**Status:** tiles, notes, snooze, skip, Due next, and the expanded specimen view all shipped (#8, #9; note migration applied). Confirmed working on production by Heinrich (redesign + care-on-tiles, 2026-09-24). The Due today filter, cross-theme/mobile badge check, and accessibility acceptance criteria below are not yet formally verified · **Roadmap:** Now · **Owner:** Heinrich · **Depends on:** `003-design-system-adoption.md` for tile styling (the logic can land first)

## Problem
Care currently lives in a separate Care view (`src/components/care/CareView.tsx`, a primary nav item). That makes Verdarium feel reminder-first: to record that you watered a plant, you leave the collection. Collectors think specimen-first ("I watered the Monstera"), not task-first.

## Goal
- Care state is visible, quietly, on every specimen tile that has a reminder.
- Care can be recorded (done, snooze, skip) directly from the tile or the expanded specimen view, without navigating away, with an optional short note.
- **Due today** becomes a **filter** on the collection.
- The Care view is replaced by a secondary **Due next** view: the upcoming care schedule.

## Non-goals
- New reminder types (fertilize, repot) or multiple reminders per specimen
- Notifications or push reminders

## Decisions (2026-09-24)
- "Due today" is a filter on the collection, not its own view.
- "Due next" is the new secondary view.
- Recording care allows a note, in a very minimal window.
- Due and overdue specimens float to the top **only when the Due today filter is on**. The unfiltered archive keeps its normal sort.

## User experience

### Tile (`BotanicalSpecimenCard`, `CompactSpecimenCard`)
- No reminder: no care UI at all.
- Upcoming: a quiet `Badge` on `color-reminder-upcoming` with a `color-botanical` dot, for example "Next care in 3 days".
- Due: a `Badge` on `color-reminder-due` with a `color-reminder-due-ink` dot, reading "Care due today".
- Overdue: a `Badge` on `color-reminder-overdue` with a `color-reminder-overdue-ink` dot, reading "Care overdue · 2 days". The state is always written out in words, not signalled by color alone.
- Due or overdue tiles also show a single quiet **Record care** action (a tonal or ghost `Button`, size `sm`).
- Snooze and skip sit in a small overflow menu (an `IconButton` opening an elevated `Surface`), reusing the `CareSpecimenActions` logic.
- Tile actions must not open the specimen (stop propagation). They must be keyboard-accessible, and each `IconButton` has a label.

### Record care with a note (minimal window)
- **Record care** shows "Recorded · Sep 24" at once, with two quiet text actions: **Add note** and **Undo**, available for about 6 seconds. It is a **deferred commit**: the record is written when the window ends, or at once when the page is hidden or closed, or before sign-out or import. Undo cancels before anything is written. The window pauses while the note popover is open.
- **Add note** opens a small popover anchored to the tile (an elevated `Surface`) containing:
  - one short `Input` (single line, 140 characters max, placeholder "Repotted, pest check…")
  - a **Save** button
  - Esc or clicking outside closes it without saving
- No dialog, no required fields, and no extra step for people who don't want notes.
- The note appears alongside that event in `CareHistory` in the expanded specimen view.

### Collection filter: Due today
- A filter in `CollectionFilters` that combines with search and the other filters.
- When active: shows only due and overdue specimens, **overdue first, then due**, then the normal sort within each group.
- When inactive: the collection keeps its normal archive sort, and care state never reorders it.
- `CollectionSummary` shows a quiet entry point, "3 specimens due today", which turns the filter on.
- Empty state (filter on, nothing due): "Nothing is due today."

### Due next view (replaces the Care view)
- A secondary view, reached from `AppNav` as a quieter item after Collection, or from `CollectionSummary`. Final placement follows the design system's navigation once it exists.
- Lists specimens with active reminders in order of next due date, grouped as **Overdue · Today · This week · Later**.
- Each row is a compact specimen label (the common name in `subtitle`, the scientific name in `scientific-name`, and the reminder badge) with the same Record care, note, snooze and skip actions.
- It reads like a stewardship register, not a to-do list: no checkboxes, counters or progress bars.
- Empty state: "No care is scheduled. Reminders can be set on any specimen record."

### Expanded specimen view
- A care section showing current state, record/snooze/skip, and `CareHistory` with notes.
- Implemented as `SpecimenCarePanel`: state, next (or snoozed) date and last recorded date, **Record care** with the same Recorded · Add note · Undo window as the tiles (it shares their pending records), and **Snooze or skip** opening the same options inline. The cadence form follows the next care date when care is recorded, so saving it never writes back a stale date.

## Data and backend
- Reuse `recordCare`, `skipCare`, `snoozeCare` (`src/care/careService.ts`) and `careSelectors.ts`. Add a selector for Due next grouping.
- **Notes need a small migration.** `care_events.metadata` (jsonb) can hold `{"note": "…"}`, but `record_specimen_care(p_action_id, p_specimen_id, p_completed_at)` has no note parameter. Options:
  - (a) a new migration adding an optional `p_note text default null` to `record_specimen_care`, stored in `metadata.note` (trimmed, 140 characters max, validated server-side)
  - (b) a separate `add_care_note(p_event_id, p_note)` RPC, which fits the "record first, add note after" flow better
  
  **Chosen: (a)** (2026-09-24), with the deferred commit above, so the note is sent with the record and no separate RPC is needed. Migration: `supabase/migrations/20260924090000_add_care_note_to_record.sql`. Until it is applied, a call with `p_note` fails with PostgREST `PGRST202`; the app then records care without the note and tells the person the note was not saved.
- Snooze options are computed from the effective due date (after the scheduled date, any current snooze, and both the local and the UTC day), so the server never rejects them. Server errors are shown in readable form.
- Local store: care history entries need an optional `note` field so signed-out collections behave the same. Update `src/care/types.ts`, `src/validation/reminder.ts` and the export/import schema.
- Use `useLocalDateRollover` so states update at local midnight.

## Acceptance criteria
- [x] Care can be recorded from a tile in both densities without opening the specimen
- [x] Undo and Add note are available right after recording. A saved note appears in care history (cloud; migration applied, confirmed on production by Heinrich)
- [ ] The Due today filter shows only due and overdue specimens, overdue first. The unfiltered collection order is unchanged.
- [x] The Due next view replaces the Care view, grouped Overdue, Today, This week, Later
- [ ] Reminder badges use the design system tokens and wording in all three themes and on mobile
- [ ] Keyboard and screen-reader accessible (labelled buttons, visible focus, popover focus handling)
- [ ] Migration passes `routines/supabase-migration-check.md`, and lint and build pass

## Open questions
- Should Due next be in the primary nav, or only reachable from the collection summary?
- Should snooze and skip also accept a note, or only recorded care?

## Demo moment
A 5–8 second clip: turn on the Due today filter, press **Record care** on an overdue tile, add "Repotted" in the note popover, and see the calm confirmation.
