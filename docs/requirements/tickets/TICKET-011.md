# TICKET-011: Recurring expenses populate each month
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Recurring expenses (REQ-10, BR-REC-1) |
| Spec | [../delivery-spec-recurring.md](../delivery-spec-recurring.md) |
| Outcome | Roadmap outcome 3 — recurring fixed expenses |
| Sequence | 11 of 15 |
| Depends on | TICKET-010 |

## Intent

As the owner, I want an active recurring expense counted in every month, so the
monthly picture is complete without re-entry.

## Behavior

Each active recurring expense contributes once to the current month and to every
following month until it is ended. Recurring amounts are combined with one-off
expenses when a month is totalled and broken down by category.

## Acceptance

- Given an active recurring expense, when a new month begins, then it is counted
  in that month (EX-REC-1).
- Given both one-off and recurring items in a month, when the month is totalled,
  then both are included.
- Given the current month, when viewed, then the recurring item appears exactly
  once for that month.

## Out of scope / notes

Dashboard presentation is TICKET-013/014. No scheduling mechanism or code here.
Recommendation awaiting human approval.
