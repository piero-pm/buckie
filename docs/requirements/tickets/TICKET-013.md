# TICKET-013: Dashboard month-on-month totals

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| Behavior | Dashboard (REQ-12, REQ-15) |
| Spec | [../delivery-spec-dashboard.md](../delivery-spec-dashboard.md) |
| Outcome | Roadmap outcome 4 — spending-visibility dashboard |
| Sequence | 13 of 15 |
| Depends on | TICKET-005, TICKET-011 |

## Intent

As the owner, I see each month's total spend and compare the current month to
prior months, so I can spot rising or falling spending.

## Behavior

The dashboard shows the signed-in user's own monthly spend totals, combining
one-off and active recurring expenses, and lets them compare the current month to
prior months. Views are responsive for iPhone and desktop browsers.

## Acceptance

- Given expenses across two or more months, when the user opens the dashboard,
  then each month's total is shown and the current month can be compared to prior
  months (EX-DASH-1).
- Given the user's first month, when they open the dashboard, then the current
  month shows and comparison indicates no prior month yet (EX-DASH-3).
- Given a month's total, when checked, then it equals that month's one-off plus
  active recurring expenses.

## Out of scope / notes

Category breakdown is TICKET-014; projection is TICKET-015. Chart visuals are UX
detail. No code or schema here. Recommendation awaiting human approval.
