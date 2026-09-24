# Routines

Recurring checklists. For now they are run manually: ask Claude "run the weekly roadmap review", or follow them yourself. Each one is written so it could become a scheduled agent later.

| Routine | Cadence | Trigger | Automation candidate? |
|---|---|---|---|
| [Weekly roadmap review](weekly-roadmap-review.md) | Weekly (Mondays) | Calendar | Yes: a scheduled agent that drafts the review as a PR |
| [Pre-deploy check](pre-deploy-check.md) | Every PR to `main` | Opening a PR | Yes: a GitHub Action for lint and build |
| [Supabase migration check](supabase-migration-check.md) | Any PR with a migration, and monthly | PR or calendar | Partly: diff and advisor checks |

## Log

Record each run in the routine's own "Run log" section: date, who ran it, and the outcome in one line.
