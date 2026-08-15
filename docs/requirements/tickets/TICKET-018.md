# TICKET-018: Persistent top header navigation

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Site navigation (REQ-18, BR-NAV-1) |
| Spec | [../delivery-spec-site-chrome.md](../delivery-spec-site-chrome.md) |
| Outcome | WORK-002 — orientation + trust |
| Sequence | WORK-002 Slice 2 — after TICKET-017 |
| Depends on | Epic A home (TICKET-013 era hub) |

## Intent

As a visitor I want an obvious Log in action at the top of every screen, and
as a user I want Expenses, Income, and Help one tap away — without a burger
menu hiding them — so I always know where I am and where I can go.

## Behavior

A single sticky header renders on every screen. Signed out: Buckie brand +
Log in button. Signed in and unlocked: brand (returns to hub) + Expenses,
Help (Income link arrives with TICKET-020) + sign-out icon. Desktop shows
icon + label per destination; iPhone widths show icons only with aria-labels.
View state moves from HomePage up to App so the header can switch views.
The hub sheds its own title/sign-out row and the "Recent expenses" button
(header covers it); Record a spend, Recurring, and Dashboard remain.

## Acceptance

- Given any signed-out screen, when the header renders, then brand + Log in
  are visible and Log in opens the email-code flow (EX-NAV-1).
- Given a signed-in unlocked user, when header destinations are used, then
  Expenses/Help switch views and sign-out ends the session (EX-NAV-2).
- Given an iPhone-width viewport, when the header renders, then destinations
  remain visible (icon-only) — no burger, nothing hidden.
- Given the hub, when the header is present, then the old duplicate
  title/sign-out row is gone and hub actions still work.

## Out of scope / notes

No URL routing library — state-based views continue (interface-system.md
constraint). Keyboard/screen-reader access via aria-labels on icon-only
destinations. Income destination is inert until TICKET-020 lands.
