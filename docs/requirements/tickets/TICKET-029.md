# TICKET-029: Dashboard B — 3/12-month trend and prediction

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Trend + prediction (REQ-24, BR-PRJ-2..3; resolves TICKET-015) |
| Spec | [../delivery-spec-home-prediction.md](../delivery-spec-home-prediction.md) |
| Outcome | WORK-003 — predict how much you will have |
| Sequence | WORK-003 Slice 3 — after TICKET-028 |
| Depends on | TICKET-028 month data, monthIncome (BA-DS-006) |

## Intent

As a user planning ahead I want average spending and saving over a
selectable window plus a projection of my future balance, so I can see
where my current habit leads.

## Behavior

Dashboard B offers a 3- or 12-month window selector. For the window it
shows average monthly spending and average monthly saving (average income
− average spending — income-aware, resolving TICKET-015 as decided in
BA-DS-008 §7) and a line chart of cumulative net over the window with a
dashed projected balance applying the average net forward. With fewer
than 3 months of history it shows guidance text instead of projections.
The old text-only projection card is superseded and removed.

## Acceptance

- Given at least 3 months of history, when the user selects 3 or 12
  months, then average spending, average saving, and the projected
  balance line reflect that window (EX-PRJ-2).
- Given fewer than 3 months of history, then guidance text shows, no
  projection (EX-PRJ-3).
- Given the window, then average saving equals average income minus
  average spending for that window.
- Given the projection, then it extends the cumulative net line by the
  average net and states its basis in plain language.

## Out of scope / notes

LineChart from @mantine/charts; projection is client-side over decrypted
records (ADR-002/003). New pure helpers (window averages, cumulative net,
projected balance) unit-tested; split to domain/prediction.ts if
aggregation.ts would exceed 200 lines. No savings targets, no per-category
forecast.
