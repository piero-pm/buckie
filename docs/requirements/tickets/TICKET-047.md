# TICKET-047: Spend-calendar heatmap

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Spend calendar (REQ-32, BR-HMAP-1) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 3 — first |
| Depends on | TICKET-045 (endedAt expansion feeds daily totals) |

## Intent

As a user I want a calendar view of when money leaves, so I see spending
streaks and heavy days over the past year.

## Behavior

A heatmap card on the dashboard shows trailing-12-month daily spend
totals using the same aggregation as the lists (one-off + recurring on
its day of month); darker means more. Rendered with @mantine/charts
Heatmap (already installed).

## Acceptance

- Given expenses across months, each day's cell intensity matches its
  total; recurring items land on their day of month.
- The card renders on iPhone width.

## Out of scope / notes

domain helper dailyTotals(expenses, recurring, today) pure + unit-tested;
HeatmapCard component keeps DashboardPage <=200 lines.
