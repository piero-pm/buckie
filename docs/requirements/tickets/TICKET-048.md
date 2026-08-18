# TICKET-048: Per-category 12-month trend lines

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Category trends (REQ-32, BR-TRD-1) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 3 — after TICKET-047 |
| Depends on | none |

## Intent

As a user I want to see how a category moves over the last year, so I
can spot creep (subscriptions, shopping).

## Behavior

A trend card plots monthly totals for the last 12 months as lines —
categories multi-selectable, default the four buckets rolled up; legacy
category values map like the donut. Rendered with @mantine/charts
LineChart (already installed).

## Acceptance

- Selecting "Subscriptions" shows its 12 monthly totals as one line.
- The default view shows four bucket lines rolled up.
- Months without data read as zero, not gaps.

## Out of scope / notes

domain helper categoryTrends(expenses, recurring, months) pure +
unit-tested; CategoryTrendCard component. Default selection may switch
to top categories if the buckets read poorly on real data (Lead note).
