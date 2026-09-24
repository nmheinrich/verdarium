# Brand and design language

## Feel

A personal herbarium or museum catalog: calm, precise, warm, and quietly premium. The collection should feel like something to be proud of, not a backlog.

## Principles

1. **The archive is the hero.** Specimen records and illustrations get the space. Care state is secondary visual information on the tile.
2. **Quiet signals.** Due and overdue states use muted tokens (`--color-reminder-due`, `--color-reminder-overdue`), not alarm red or counters that shout.
3. **Scientific structure.** Scientific names are shown with care (italic binomials, cultivar in quotes). Labels resemble specimen-sheet fields.
4. **Illustration, not photography.** Watercolor botanical plates are defined in `src/constants/illustrations.ts`. New art must match that style.
5. **Restraint in motion.** Motion is subtle and purposeful, and is disabled under reduced motion.

## Themes

| Theme | Character |
|---|---|
| Archive (default) | Warm parchment, muted olive, restrained museum tones |
| Herbarium | Fresher botanical palette, green field-journal accents |
| Night Archive | Dark archival presentation, soft botanical contrast |

Tokens are defined in `src/styles/tokens.css`. Always use tokens and never hardcode colors.

## Voice

- Calm, precise, and gently literary. Say "Recorded", "Added to the archive", "Due today".
- Use the vocabulary: specimen, archive, record, catalog, acquisition, provenance.
- Avoid exclamation marks, "Oops!", streaks, badges-as-rewards, emoji in UI, and guilt language ("You forgot…").

## Care-state wording

| State | Wording |
|---|---|
| upcoming | "Next care in 3 days" |
| due | "Care due today" |
| overdue | "Care overdue · 2 days" (factual, not scolding) |
| recorded | "Recorded · Sep 23" |
