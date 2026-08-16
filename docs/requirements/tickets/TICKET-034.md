# TICKET-034: Vault overwrite endpoint (PUT /api/vault)

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Passphrase change, server half (REQ-26, BR-PASS-2) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 3 — first |
| Depends on | None |

## Intent

As a user changing my passphrase I need the server to accept a
replacement vault envelope, so the change can complete without
re-creating my account.

## Behavior

PUT /api/vault (authenticated) accepts the same body shape as POST —
salt, params, verifier — validates it identically, and overwrites the
existing row for the session's user. Responds 204. Unauthenticated 401;
invalid body 400. Unlike POST it is repeatable and never 409s.

## Acceptance

- Given an authenticated PUT with a valid envelope, then a following
  GET /api/vault returns the new envelope.
- Given a second PUT, then it also succeeds (idempotent overwrite).
- Given no session, then 401 and the stored envelope is unchanged.

## Out of scope / notes

store.go gains an Update method; handler wiring mirrors the POST
validation (non-empty params, decodable base64). No schema change;
rollback = revert commit. Go tests: overwrite, repeat, unauth,
cross-user isolation unchanged.
