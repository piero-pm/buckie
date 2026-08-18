# TICKET-052: gray.5 contrast sweep + WORK-001 ticket closure

Status: approved with WORK-007 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Contrast sweep + ledger accuracy (REQ-36, BR-CONT-1, BR-TICK-DOC-1) |
| Spec | [../delivery-spec-navigation-ux.md](delivery-spec-navigation-ux.md) |
| Outcome | WORK-007 — navigation & UX |
| Sequence | WORK-007 Slice 3 |
| Depends on | none (rides the same push) |

## Intent

As a user with less-than-perfect eyesight I want small helper text to
meet AA contrast; and the ticket ledger should say what shipped.

## Behavior

All small gray.5 text switches to gray.6 (~6:1 on white, passes AA
4.5:1) across pages — 22 uses in 14 files at direction time. The
accepted filled-button label trade-off (≈3.5:1) is untouched. Docs:
TICKET-001..015 statuses close as Shipped (WORK-001 ledger debt).

## Acceptance

- No c="gray.5" remains in src (grep).
- Spot-check small text reads darker; TICKET-001..015 show Shipped.

## Out of scope / notes

Chart internal label colors stay (canvas-like, reviewed separately);
dark theme stays out (light-only product today).
