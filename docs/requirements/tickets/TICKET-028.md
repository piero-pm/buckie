# TICKET-028: Dashboard A — 3-month benchmark and spend funnel

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Month view (REQ-24, BR-PRJ-1) |
| Spec | [../delivery-spec-home-prediction.md](../delivery-spec-home-prediction.md) |
| Outcome | WORK-003 — month against expectation |
| Sequence | WORK-003 Slice 3 — first |
| Depends on | TICKET-027 home order, BA-DS-003/006 semantics |

## Intent

As a user mid-month I want to see my spend against expectation and where
my money went, so I know my pace and my shape of spending at a glance.

## Behavior

Dashboard A keeps the existing month select, totals (spend, income, net)
and the category donut. It adds an expected-expenditure benchmark — the
average of the last up to 3 months (hidden when no prior month exists) —
shown beside the current total with under/over pace. It adds a funnel:
income -> fixed costs (recurring rent and bills categories) -> other
spending -> saved, from the same month data.

## Acceptance

- Given a month with at least one prior month, then the month view shows
  the 3-month-average benchmark and the funnel (EX-PRJ-1).
- Given fewer than 3 prior months, then the benchmark averages what
  exists; with no prior month it is hidden.
- Given recurring rent/bills templates, then fixed costs include their
  expanded month total, not just one-off records.
- Given any month, then funnel values are internally consistent: income =
  fixed + other + saved, with saved matching net.

## Out of scope / notes

FunnelChart from @mantine/charts; light theme, WCAG AA. Aggregation
helpers pure and unit-tested (clean-artifacts: split files if > 200
lines). Income-unaware savings projection card is superseded by
TICKET-029 and removed there.
