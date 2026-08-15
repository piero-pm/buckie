# TICKET-021: Two-stage onboarding

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | First-run education + income setup (REQ-21, BR-ONB-1/2) |
| Spec | [../delivery-spec-income.md](../delivery-spec-income.md) |
| Outcome | WORK-002 — trust before data |
| Sequence | WORK-002 Slice 4 — after TICKET-020 |
| Depends on | TICKET-019 (PrivacyExplainer), TICKET-020 |

## Intent

As a new user I want Buckie to first explain how it works and exactly how my
privacy is protected, and only then ask for my income sources — so I make an
informed choice before entrusting financial data. As an existing user with no
income yet, I get the same chance once, without nagging.

## Behavior

On unlock, if the income register is empty, a two-stage onboarding replaces
the hub: stage 1 explains the product loop and the privacy/encryption model
(the shared PrivacyExplainer); stage 2 offers income entry (salary, savings,
investment) with Skip. Completing or skipping returns to the hub. Skip leaves
a dismissible "Set up your income" card there until a source exists; stage 1
is never re-shown after Skip — Help keeps that content available.

## Acceptance

- Given an unlock with an empty income register, when onboarding starts, then
  stage 1 (how it works + privacy) precedes any income entry (EX-ONB-1).
- Given stage 2, when sources are added or skipped, then the user lands on
  the hub with their choices saved / the card shown (EX-INC-1, EX-ONB-2).
- Given a skipped onboarding, when the user unlocks again, then stage 1 does
  not re-appear and the hub card links to the Income section (BR-ONB-2).
- Given a user with at least one income source, when they unlock, then
  onboarding does not appear.

## Out of scope / notes

No server-side onboarding flag: emptiness of the encrypted income register
drives everything, so the E2E invariant holds (no metadata leaks). The
skip-dismissal lives in session state; the hub card is recomputed from data.
Existing production users see the flow once, by design.
