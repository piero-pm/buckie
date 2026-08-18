# TICKET-042: One-off income events

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | One-off income events (REQ-33, BR-IOFF-1) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 1 — first |
| Depends on | none |

## Intent

As a user I want to record a bonus, gift, or refund as a one-off money-in
event, so the month it lands in reflects it.

## Behavior

An event is an encrypted record (kind `income_event`: id, amount, date,
eventKind bonus|gift|refund|other, optional note). It counts as income
in its month everywhere income is aggregated (saved bar, sankey,
trend). Invalid kinds are rejected server-side like other kinds.

## Acceptance

- Given a 500 bonus event dated in June, June's income includes 500
  (EX-IC-2).
- Given an invalid kind, the server rejects the PUT (mirror of the
  expectations-kind Go test).
- Event add/list/delete on the Income page round-trips encrypted.

## Out of scope / notes

Server change is one whitelist line + test. Client: domain/incomeEvent.ts
(type + validation + build), api/records incomeEvents, useWorkspace
events state, IncomePage section. monthIncome(sources, month) gains an
events parameter.
