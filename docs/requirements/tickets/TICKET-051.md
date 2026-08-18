# TICKET-051: Settings — currency + idle auto-lock

Status: approved with WORK-007 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Settings page (REQ-35, BR-CUR-1, BR-LOCK-IDLE-1) |
| Spec | [../delivery-spec-navigation-ux.md](../delivery-spec-navigation-ux.md) |
| Outcome | WORK-007 — navigation & UX |
| Sequence | WORK-007 Slice 2 |
| Depends on | TICKET-049 (/settings route) |

## Intent

As a user I want my display currency and an idle auto-lock window under
my control, in one place.

## Behavior

A 'settings' encrypted record (fixed-id, new server whitelist kind)
holds { currency, idleLockMinutes }. The Settings page edits both:
currency (EUR/USD/GBP…), idle lock (Never/5/15/30/60 min, default
Never — gate 2026-08-18). Formatting switches everywhere via a
formatMoney(currency) helper replacing formatEUR; stored amounts never
convert. Idle lock: activity = click, key, scroll, touch; on expiry the
cached key clears and the app routes to unlock.

## Acceptance

- Currency USD renders $ everywhere with unchanged stored values
  (EX-NU-5).
- Idle lock 5 min with no activity locks; unlock re-asks the passphrase
  (EX-NU-6); "Never" never locks.

## Out of scope / notes

useWorkspace gains settings load/save; useIdleLock hook mounts in the
authed shell; backup export includes the kind (listAll already
patterned).
