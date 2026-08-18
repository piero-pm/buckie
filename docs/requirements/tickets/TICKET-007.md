# TICKET-007: Expense data-quality validation
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Data-quality (REQ-6, BR-DQ-1..4) |
| Spec | [../delivery-spec-capture.md](../delivery-spec-capture.md) |
| Outcome | Roadmap outcome 2 — low-friction capture |
| Sequence | 7 of 15 |
| Depends on | TICKET-005, TICKET-006 |

## Intent

As the owner, I want invalid entries rejected clearly, so my spending data stays
trustworthy for the dashboard.

## Behavior

On save the system enforces: amount required, greater than 0, at most two decimal
places (BR-DQ-1); a single Phase 1 currency (BR-DQ-2); date required and not in
the future, today allowed (BR-DQ-3); category required from the taxonomy
(BR-DQ-4). Invalid input is refused with a clear reason and nothing is stored.

## Acceptance

- Given an amount greater than 0 with at most two decimals, when saved, then it
  is accepted (EX-CAP-2).
- Given 0, a negative, or non-numeric amount, when saving, then it is refused
  with a clear reason (EX-CAP-4).
- Given no category, when saving, then it is refused and the missing category is
  indicated (EX-CAP-3).
- Given a future date, when saving, then it is refused; today and past dates are
  allowed (EX-CAP-6).

## Out of scope / notes

Open human decisions: Phase 1 currency value, sane maximum amount, and oldest
allowed past date. No code or schema here. Recommendation awaiting human approval.
