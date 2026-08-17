# TICKET-037: Expectations record + onboarding stage 3 + Expected view

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Expectations model + entry points (REQ-28, BR-EXP-SET-1..2) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 1 — after TICKET-036 |
| Depends on | TICKET-036 taxonomy buckets |

## Intent

As a user I want to state my starting balance and what I expect to spend
per bucket — at onboarding and anytime after — so the app can compare
plan vs reality.

## Behavior

Expectations are one encrypted record (kind "expectations", fixed id):
starting balance + expected monthly amounts for rent, bills, groceries,
going out, shopping, subscriptions — all manual. Onboarding gains a
separate third stage collecting balance, groceries, going out, and
shopping (rent/bills/subscriptions optional). An "Expected" entry in the
top bar opens a view editing all six plus the balance; saves apply
immediately.

## Acceptance

- Given onboarding, after income setup the third stage collects balance
  + the three core expectations and completes (EX-EA-1).
- Given the Expected view from the top bar, editing a figure and saving
  updates the stored record (EX-EA-2).
- Given the server, the "expectations" kind round-trips like any
  encrypted record.

## Out of scope / notes

domain/expectations.ts (shape + validation, amounts > 0 two decimals,
all optional except balance? — balance required in onboarding, editable
later); validKind adds "expectations" (one line + Go test); api facade +
useWorkspace loads it; OnboardingPage stage 3; ExpectedPage + View union
+ AppHeader link (no burger). Skip in onboarding writes the durable
skip marker as today.
