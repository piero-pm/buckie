# TICKET-022: Dashboard income and net

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Dashboard income + net (REQ-22) |
| Spec | [../delivery-spec-income.md](../delivery-spec-income.md) |
| Outcome | WORK-002 — complete monthly picture |
| Sequence | WORK-002 Slice 4 — with TICKET-021 |
| Depends on | TICKET-020 (income data), TICKET-013 (dashboard) |

## Intent

As the owner I want the dashboard to show monthly income and net (income −
expenses) next to the existing spend charts, so one glance answers "am I
ahead or behind this month?" instead of only "what did I spend?".

## Behavior

The dashboard keeps its month picker, donut, and bar chart unchanged and adds
an income summary: monthly income total (from active sources expanded into
the month) and net = income − expenses for the selected month. Months without
income sources show a zero/informational state, not an error.

## Acceptance

- Given a month with income sources and expenses, when the dashboard renders,
  then income total and net are shown for that month (EX-DASH-6).
- Given a month before any income source existed, when selected, then income
  shows zero and net equals −expenses.
- Given existing users with no income sources, when the dashboard renders,
  then everything behaves exactly as before plus a zero-income line.

## Out of scope / notes

Savings-projection math is deliberately unchanged — whether projection
becomes income-aware stays the open human decision recorded in TICKET-015 /
traceability §5. Income aggregation reuses the recurring expansion pattern
client-side over decrypted records only.
