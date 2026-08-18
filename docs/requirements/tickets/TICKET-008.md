# TICKET-008: Duplicate expense handling
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Duplicate handling (REQ-7, BR-DQ-5) |
| Spec | [../delivery-spec-capture.md](../delivery-spec-capture.md) |
| Outcome | Roadmap outcome 2 — low-friction capture |
| Sequence | 8 of 15 |
| Depends on | TICKET-005, TICKET-007 |

## Intent

As the owner, I want to be warned about likely duplicate entries but still able to
keep genuine repeats, so my data is accurate without blocking real spending.

## Behavior

When a new expense matches an existing one on amount, category, and date, the
system shows a likely-duplicate warning. The user may confirm and keep it, or
cancel. The warning never blocks a genuine repeat purchase.

## Acceptance

- Given an expense with the same amount, category, and date already exists, when
  the user saves another, then a duplicate warning is shown (EX-CAP-5).
- Given the warning, when the user confirms, then the expense is kept.
- Given the warning, when the user cancels, then nothing is added.

## Out of scope / notes

The duplicate-detection window (e.g. same day only) is an open human decision. No
code or schema here. Recommendation awaiting human approval.
