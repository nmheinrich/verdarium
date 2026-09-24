# Weekly roadmap review

**Cadence:** weekly (Mondays) · **Output:** an updated `ROADMAP.md` in a `docs/roadmap-YYYY-MM-DD` PR

## Steps

1. **What shipped?** Run `git log main --since="1 week ago" --oneline` and list merged PRs with `gh pr list --state merged --limit 20`.
2. **Update statuses** in `ROADMAP.md` (Now / Next / Later and the MVP exit criteria) and in `specs/README.md`.
3. **Customer signal:** read `customers/private/feedback-log.md` if it exists locally. Move anonymised patterns into `customers/insights.md`. Never copy names or quotes that identify someone.
4. **Validation signals:** note any progress against the signals in the ROADMAP validation plan.
5. **Re-prioritise:** is "Now" still the right three things? Anything blocked? Move items between sections with a one-line reason.
6. **Demos:** is anything newly shipped worth capturing? Add it to the `demos/README.md` shot list.
7. **Decision log:** record any decisions made this week.
8. Update `_Last reviewed:_` at the top of `ROADMAP.md`, then open the PR.

## Questions for Heinrich
List anything that needs a decision at the end of the PR description instead of guessing.

## Run log

| Date | By | Outcome |
|---|---|---|
| 2026-09-24 | Claude | First run. Statuses updated across `ROADMAP.md`, `specs/001`, `specs/003`, `specs/README.md`, and `demos/README.md`. Multi-collection and six post-MVP feature ideas reviewed and ranked (none scheduled). Flagged a possible product-name conflict (`verdarium.green`) for Heinrich's decision — see PR. |
