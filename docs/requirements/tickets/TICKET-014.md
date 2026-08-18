# TICKET-014: Dashboard spend-by-category breakdown
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Dashboard (REQ-13) |
| Spec | [../delivery-spec-dashboard.md](../delivery-spec-dashboard.md) |
| Outcome | Roadmap outcome 4 — spending-visibility dashboard |
| Sequence | 14 of 15 |
| Depends on | TICKET-013 |

## Intent

As the owner, I see how a month's spending splits across categories, so I can spot
where my money actually goes.

## Behavior

For a selected month, the dashboard shows the user's spend broken down by the
taxonomy categories, including both one-off and active recurring expenses. The
category totals sum to the month total shown in TICKET-013.

## Acceptance

- Given one-off and recurring expenses in the selected month, when the user views
  the breakdown, then each category total includes both (EX-DASH-2).
- Given a category breakdown, when the totals are summed, then they equal the
  month total.
- Given a month with no spend in a category, when viewed, then that category shows
  zero or is omitted consistently.

## Out of scope / notes

Chart type and colours are UX detail, not specified here. No code or schema here.
Recommendation awaiting human approval.
