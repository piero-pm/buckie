# TICKET-009: Review and correct recent expenses
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Expense capture (REQ-8) |
| Spec | [../delivery-spec-capture.md](../delivery-spec-capture.md) |
| Outcome | Roadmap outcome 2 — low-friction capture |
| Sequence | 9 of 15 |
| Depends on | TICKET-005 |

## Intent

As the owner, I review my recent expenses and fix mistakes, so my data stays
accurate after a slip.

## Behavior

The user sees a list of their recent expenses (amount, category, date). They can
edit an entry's amount, category, or date, or delete an entry. Edits re-apply the
data-quality rules. Changes affect only the acting user's own data.

## Acceptance

- Given a recent expense, when the user edits its amount, category, or date and
  saves, then the change is stored and shown, subject to validation.
- Given a recent expense, when the user deletes it, then it is removed from their
  list and no longer counts toward totals.
- Given an edit with invalid input, when saving, then it is refused with a clear
  reason (rules from TICKET-007).

## Out of scope / notes

Bulk edit and history/audit of changes are out of scope for Phase 1. No code or
schema here. Recommendation awaiting human approval.
