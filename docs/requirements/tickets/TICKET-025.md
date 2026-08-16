# TICKET-025: Mutation error audit — no silent failures

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Honest errors, data side (REQ-23, BR-ERR-4) |
| Spec | [../delivery-spec-login-scale.md](../delivery-spec-login-scale.md) |
| Outcome | WORK-003 — honest unhappy paths |
| Sequence | WORK-003 Slice 1 — after TICKET-024 |
| Depends on | Existing workspace mutation APIs |

## Intent

As a user saving or deleting data I want every failure to be visible with
guidance, so nothing is silently lost, silently kept, or silently undone.

## Behavior

Every mutation surface — expense add/edit/delete, recurring add/end/
delete, income add/end/delete, vault setup/unlock — shows a busy state
while the encrypted API call runs and a visible error message if it
fails. Local state changes only after the API succeeds (the workspace
hook already enforces order; callers must catch). CapturePage is the
reference pattern; the audit extends the same pattern everywhere, with
one shared message style (inline for forms, notification toast for list
actions).

## Acceptance

- Given the connection drops, when the user saves an expense, then a
  visible error appears and nothing is silently lost or kept (EX-ERR-2).
- Given any delete or end action failing, when the API errors, then the
  row remains and an error toast explains the failure.
- Given any mutation in flight, when latency is high, then the control is
  busy and not double-submittable.
- Given the audit, when reviewed, then no mutation path updates local
  state without a successful API response (BR-ERR-4).

## Out of scope / notes

Frontend-only; no API changes. Load-failure handling already exists
(loadError) — copy reviewed, not redesigned. vitest: one failing-mutation
case per surface family (expense, recurring, income, vault).
