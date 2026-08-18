# TICKET-012: Edit or end a recurring expense
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Recurring expenses (REQ-11) |
| Spec | [../delivery-spec-recurring.md](../delivery-spec-recurring.md) |
| Outcome | Roadmap outcome 3 — recurring fixed expenses |
| Sequence | 12 of 15 |
| Depends on | TICKET-011 |

## Intent

As the owner, I change or stop a recurring expense when my fixed costs change, so
future months stay accurate while history is preserved.

## Behavior

The user can edit a recurring expense's amount or category, or end it. Ending it
excludes it from future months and leaves past months unchanged. Editing the
amount applies going forward.

## Acceptance

- Given an active recurring expense, when the user ends it, then future months
  exclude it and past months keep it unchanged (EX-REC-4).
- Given an active recurring expense, when the user changes its amount, then future
  months use the new amount and past months are unchanged (EX-REC-5).
- Given an ended recurring expense, when a later month is viewed, then it is not
  counted.

## Out of scope / notes

Open human decision: whether an amount edit takes effect in the current month or
the next month; whether pausing (vs ending) is offered. No code here.
Recommendation awaiting human approval.
