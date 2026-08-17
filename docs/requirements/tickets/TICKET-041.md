# TICKET-041: Projection anchored at starting balance

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Anchored projection (REQ-30, BR-PRJ-2) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 3 — after TICKET-040 |
| Depends on | TICKET-037 expectations record |

## Intent

As a user I want the trend's balance line to start from my actual bank
balance, so the projection shows where my real money is heading.

## Behavior

The trend's cumulative balance line starts from the starting balance
once set, and the projected balance continues from that anchored line.
Without a starting balance, both start from zero (today's behavior).

## Acceptance

- Given a starting balance of 2000, the cumulative line's first point is
  2000 and the projection extends the anchored line (EX-EA-6).
- Given no starting balance, the line starts at zero as today.

## Out of scope / notes

cumulativeNet gains an optional startingBalance parameter (pure,
unit-tested); TrendView consumes expectations.startingBalance; basis
stated in plain language on the card as today.
