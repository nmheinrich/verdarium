# Brand and design language

## Source of truth

**The Verdarium design system artifact:** https://claude.ai/artifact/LH7dSvQKKg6XxccrmMcwjN

- Read its `project/README.md` (the brand book) and `project/tokens.json` before any UI work. Read them through the Artifact tool, not by web-fetching.
- It defines tokens for all three themes, type, spacing, radius, shadows, and five UI components: Button, IconButton, Input, Badge, Surface.
- It does **not** yet cover app-level components (specimen tile, forms, navigation). For those, follow its principles and flag gaps.
- The app is being brought in line with it by `specs/003-design-system-adoption.md`. Until that ships, `src/styles/tokens.css` still has the older values. When they conflict, the design system wins.
- If you change a token or component in code, the design system should be updated to match (and vice versa). Mention it in the PR.

This file is a quick summary. The design system is authoritative.

## Feel

A quiet museum archive: soft warm linen whites, muted olive accents, serif headings, hairline borders, very soft shadows. Nothing shouts. The collection should feel like something to be proud of, not a backlog.

## Themes

| Theme | Character |
|---|---|
| Archive (default) | Soft linen whites and a muted olive |
| Herbarium | Fresher field-journal palette, a clear fern green |
| Night Archive | Dark, with a lively lichen-sage green |

Themes are applied as `data-theme` on `:root`. Style with tokens only, never hex values.

## Type

- **TAY Roony** (display, caps only, hand-drawn serif): headings and tile titles. Never bold it. Use no dashes and keep lines short.
- **Newsreader italic**: scientific names, directly under the common name. This is the only place italics appear.
- **Figtree**: all UI copy. `metadata-label` is uppercased by CSS.
- Write source copy in sentence case and never type capitals.
- A tile reads like a museum label: the common name in capitals, with the Latin name beneath in italic. Never truncate a plant name.

## Color essentials

- `color-botanical` is the only brand hue: the primary button, links, and selected states. Use it sparingly.
- Text tones: `color-text-primary`, `color-text-secondary` and `color-text-muted`, each used as the design system specifies.
- Care states pair a tinted ground with an ink dot, and the state is always written out in words:

| State | Ground | Dot / ink | Wording |
|---|---|---|---|
| upcoming | `color-reminder-upcoming` | `color-botanical` | "Next care in 3 days" |
| due | `color-reminder-due` | `color-reminder-due-ink` (ochre) | "Care due today" |
| overdue | `color-reminder-overdue` | `color-reminder-overdue-ink` (terracotta) | "Care overdue · 2 days" (factual, not scolding) |
| recorded | — | — | "Recorded · Sep 24" |

## Voice

- Write as a curator would. The collection is an **archive**, plants are **specimens**, entries are **records** or **plates**, and care is **stewardship**.
- Calm and exact. Empty states describe what is missing ("No specimens match these criteria").
- Avoid exclamation marks, jokes, emoji, streaks, badges-as-rewards, and guilt language ("You forgot…").

## Imagery and icons

- Soft watercolor botanical illustrations (fern, monstera, palmate, succulent, vine), never stock photography. New art must match.
- Lucide icons: outline style, 16px, 1.75 stroke, inheriting the text color. `Leaf` is the botanical motif.

## Motion

Subtle and purposeful: 120–320ms on `cubic-bezier(0.2, 0, 0, 1)`. Always honor `prefers-reduced-motion`.
