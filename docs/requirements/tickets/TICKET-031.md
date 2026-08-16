# TICKET-031: Lock on sign-out + quick wins

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Lock + quick wins (REQ-25 BR-LOCK-1, REQ-27 BR-QW-1..2) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 1 — after (or parallel to) TICKET-030 |
| Depends on | None |

## Intent

As a user I want signing out to actually lock my space, and small
honesty fixes in copy and month selection, so security and the UI match
reality.

## Behavior

Signing out clears the cached encryption key from device storage before
returning to the landing view; the next sign-in on that device requires
the passphrase again. The landing self-hosting copy quotes the hosting
cost in EUR. The dashboard month selector always offers the current
month, even when it has no data yet.

## Acceptance

- Given an unlocked space, when the user signs out and signs back in on
  the same device, then the passphrase is required again and the device
  key store is empty (EX-LOCK-1).
- Given the landing page, then the hosting cost shows "€", not "£".
- Given a current month with zero spend and income, then it still
  appears in the dashboard month selector and shows zero totals.

## Out of scope / notes

App.tsx sign-out awaits clearKey(userId) before resetting state.
Dashboard month options = data months plus current month (dashboard
summary renders zeros). No idle auto-lock (WORK-007). vitest with
fake-indexeddb for the key-store assertion; existing App tests updated.
