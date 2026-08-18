# TICKET-010: Register a recurring monthly expense
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Recurring expenses (REQ-9, BR-REC-1) |
| Spec | [../delivery-spec-recurring.md](../delivery-spec-recurring.md) |
| Outcome | Roadmap outcome 3 — recurring fixed expenses |
| Sequence | 10 of 15 |
| Depends on | TICKET-006, TICKET-007 |

## Intent

As the owner, I register a known monthly cost once, so I do not re-enter fixed
expenses like rent or subscriptions every month.

## Behavior

A signed-in user adds a recurring monthly expense with an amount, a category from
the taxonomy, and a day-of-month it applies. Data-quality rules for amount and
category apply. The item is attributed to that user only.

## Acceptance

- Given a signed-in user, when they add a recurring expense with a valid amount
  and category, then it is recorded (EX-REC-1).
- Given a recurring expense set to the 31st, when a month is shorter, then it
  applies on that month's last day (EX-REC-2).
- Given an invalid amount or missing category, when saving, then it is refused
  with a clear reason (EX-REC-3).

## Out of scope / notes

Only monthly recurrence is in scope (no weekly/annual). No scheduling mechanism,
schema, or code here. Recommendation awaiting human approval.
