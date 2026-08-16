# TICKET-027: Returning-home scroll restructure

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Home flow (REQ-24, BR-HOME-1..2) |
| Spec | [../delivery-spec-home-prediction.md](../delivery-spec-home-prediction.md) |
| Outcome | WORK-003 — daily loop on one surface |
| Sequence | WORK-003 Slice 2 — after TICKET-026 |
| Depends on | TICKET-026 capture entry, existing dashboard components |

## Intent

As a returning user I want to land ready to record a spend and scroll into
my month and my trend, so the whole daily loop lives on one page.

## Behavior

First-login onboarding is unchanged (BR-ONB-1/2 stay authoritative). After
onboarding, subsequent logins open one scrollable home ordered: add-
expense entry at top, then Dashboard A (month view), then Dashboard B
(trend view). Recent expenses and the income-setup card remain available
on the surface. The persistent header, its destinations, and the no-burger
rule are unchanged. Desktop and iPhone Safari scroll cleanly (WCAG 2.2 AA
per interface-system).

## Acceptance

- Given an onboarded user signs in, then the home shows the add-expense
  entry first (EX-HOME-1).
- Given the user scrolls, then the month view is reached before the trend
  view (EX-HOME-1).
- Given a first-time user unlocking, then the two-stage onboarding runs
  exactly as before (BR-HOME-1).
- Given an iPhone Safari viewport, then the full scroll is usable and the
  header stays persistent (BR-HOME-2).

## Out of scope / notes

Frontend-only view composition; view state stays state-based (no URL
routing — WORK-002 decision). The hub's quick actions fold into the new
order; Recurring/Income/Help destinations unchanged. Month select and
chart internals belong to TICKET-028/029.
