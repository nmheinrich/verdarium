# Customers

**This repo is public.** Only templates, personas, and anonymised synthesis are committed here.

## Where things go

| Material | Location | Committed? |
|---|---|---|
| Personas, templates, anonymised insights | `customers/` | Yes |
| Interview notes, names, emails, raw feedback, recordings | `customers/private/` | **No** (gitignored) |

Use pseudonyms in anything committed ("Collector A — aroid specialist, ~80 specimens").

## Workflow

1. Recruit from plant forums and subreddits, local plant societies, specialty nurseries, and interior plant pros.
2. Before a session, copy `_templates/interview.md` to `customers/private/YYYY-MM-DD-<pseudonym>.md`.
3. After the session, add a row to `customers/private/feedback-log.md` using `_templates/feedback-log.md`.
4. During the weekly roadmap review, move anonymised patterns into `insights.md`.

## Files

- `personas.md`: who we're building for
- `insights.md`: anonymised, recurring patterns (committed)
- `_templates/`: interview script and feedback log format
