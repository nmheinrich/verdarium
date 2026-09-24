# 001 — Care on specimen tiles

**Status:** draft · **Roadmap:** Now · **Owner:** Heinrich

## Problem
Care currently lives in a separate Care view (`src/components/care/CareView.tsx`, a primary nav item). That makes Verdarium feel reminder-first: to record that you watered a plant, you leave the collection. Collectors think specimen-first ("I watered the Monstera"), not task-first.

## Goal
- Care state is visible, quietly, on every specimen tile that has a reminder.
- Care can be recorded (done, snooze, skip) directly from the tile or the expanded specimen view, without navigating away.
- The Care view becomes a secondary **"Due today"** list: a convenience for days with a lot to do, not a main destination.

## Non-goals
- New reminder types (fertilize, repot) or multiple reminders per specimen
- Notifications or push reminders
- Changes to the care history schema

## User experience

### Tile (`BotanicalSpecimenCard`, `CompactSpecimenCard`)
- No reminder: no care UI at all.
- Upcoming: small muted line, e.g. "Next care in 3 days".
- Due or overdue: a soft tinted band using `--color-reminder-due` or `--color-reminder-overdue`, plus a single quiet **Record care** action.
- After recording: a brief confirmation ("Recorded · Sep 23"), the state moves to upcoming, and an undo is available for a few seconds.
- Snooze and skip sit in a small overflow menu on the tile (reusing `CareSpecimenActions` logic).
- Tile actions must not trigger opening the specimen (stop propagation), and must be keyboard-accessible.

### Expanded specimen view
- A care section showing current state, the record, snooze, and skip actions, and `CareHistory`.

### "Due today"
- Removed as a peer of Collection in `AppNav`. Reached via a quiet entry on the dashboard (e.g. in `CollectionSummary`: "3 specimens due today") and/or a collection filter.
- Shows only due and overdue specimens, using the same tiles and actions as the collection.
- Empty state: calm and positive ("Nothing due today.").

## Data and backend
- No schema change expected. Reuse `recordCare`, `skipCare`, and `snoozeCare` from `src/care/careService.ts` and the selectors in `careSelectors.ts`.
- Must work identically with the local and cloud stores.
- Use `useLocalDateRollover` so the state updates at local midnight.

## Acceptance criteria
- [ ] Care can be recorded from a tile in both card variants without opening the specimen
- [ ] Due and overdue states are visible but calm in all three themes and on mobile
- [ ] Undo is available immediately after recording
- [ ] "Care" is no longer a primary nav item, and "Due today" is reachable from the collection
- [ ] Care history reflects actions taken from tiles (signed in)
- [ ] Keyboard and screen-reader accessible (labelled buttons, focus visible)
- [ ] Lint and build pass, and REVIEW.md checklist is done

## Open questions
- Should "Due today" be a filter chip on the collection, a separate lightweight view, or both?
- Is undo enough, or should recording care also allow a short note ("repotted, pest check")?
- Should overdue specimens float to the top of the collection by default, or does that break the archive feel?

## Demo moment
A 5–8 second clip: scrolling the archive, tapping **Record care** on a due tile, and the calm confirmation.
