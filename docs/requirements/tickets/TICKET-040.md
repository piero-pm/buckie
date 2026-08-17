# TICKET-040: Sankey month flow (replaces funnel)

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Sankey (REQ-30, BR-SANK-1) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 3 — first |
| Depends on | TICKET-036 buckets |

## Intent

As a user I want to see my income flow into my spending buckets and
what remains saved, as one picture.

## Behavior

A sankey chart replaces the funnel on the month view: income (sources +
one-offs if present) flows into fixed costs (Rent, Bills, Insurance),
the expected buckets (groceries, going out, shopping, subscriptions),
other spend, and saved. Nodes without flow in the month are omitted.
Zero income shows a guidance card instead.

## Acceptance

- Given income and spending in a month, the sankey shows income
  splitting into buckets with saved as the remaining flow (EX-EA-5).
- Given flows, node and link values equal the month's bucket totals
  and income-minus-spend for saved.

## Out of scope / notes

recharts Sankey used directly (human-approved interface exception
2026-08-17); add recharts as an explicit package.json dependency
(already transitively present via @mantine/charts). Pure builder
(monthFlows -> recharts nodes/links) unit-tested; SpendFunnel and
monthFunnel superseded and removed. Fallback for narrow screens: sankey
keeps a horizontal scroll container.
