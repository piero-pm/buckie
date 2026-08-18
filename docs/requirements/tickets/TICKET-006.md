# TICKET-006: Category taxonomy dropdown
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Category taxonomy (REQ-5, BR-CAT-1) |
| Spec | [../delivery-spec-capture.md](../delivery-spec-capture.md) |
| Outcome | Roadmap outcome 2 — low-friction capture |
| Sequence | 6 of 15 |
| Depends on | TICKET-005 |

## Intent

As the owner, I choose a category from a consistent fixed list, so my spending is
classified the same way every time and the dashboard can group it.

## Behavior

The category field is a fixed dropdown offering the approved taxonomy. The
recommended set (pending human approval) is: Rent, Bills, Food, Transport &
Travel, Gift, Health, Shopping, Miscellaneous. The same list is used by capture
and recurring expenses. Users cannot add custom categories in Phase 1.

## Acceptance

- Given the capture screen, when the user opens the category field, then the
  approved list is shown as a dropdown.
- Given a chosen category, when the expense is saved, then it is stored under
  that category (EX-CAP-1).
- Given the recurring screen, when a category is chosen, then the same taxonomy
  is offered.

## Out of scope / notes

The final category list is an open human decision: confirm the set, keep "Flight"
separate or folded into Transport & Travel, and accept or drop the Health/Shopping
additions. User-defined categories are out of scope. Recommendation awaiting
human approval.
