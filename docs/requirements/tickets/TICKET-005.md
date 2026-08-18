# TICKET-005: Record an expense (amount, category, date)
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Expense capture (REQ-4, REQ-15) |
| Spec | [../delivery-spec-capture.md](../delivery-spec-capture.md) |
| Outcome | Roadmap outcome 2 — low-friction capture |
| Sequence | 5 of 15 |
| Depends on | TICKET-002 |

## Intent

As the owner, I quickly record a spend with an amount and a category, so my
spending is captured in the moment on my phone.

## Behavior

A signed-in user enters an amount, picks a category, and saves. The date defaults
to today and may be changed to a past date. The saved expense is attributed to
that user and shown in their recent-expenses list. Capture works comfortably on
an iPhone mobile browser and on desktop.

## Acceptance

- Given a signed-in user, when they enter a valid amount, pick a category, and
  save, then the expense is stored for today and appears in their recent list
  (EX-CAP-1).
- Given a user changes the date to a past date, when they save, then the expense
  records under that date.
- Given the capture screen on an iPhone browser, when used one-handed, then a
  spend can be recorded in a few taps.

## Out of scope / notes

Validation detail is TICKET-007; taxonomy is TICKET-006; duplicates TICKET-008.
No storage schema or code here. Recommendation awaiting human approval.
