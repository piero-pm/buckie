# TICKET-030: Server hardening — size limit, /health, upsert kind

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Server hardening (REQ-27, BR-HARD-1..3) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 1 — first |
| Depends on | None |

## Intent

As the operator I want the record endpoint bounded, a liveness probe,
and no kind drift on re-upload, so the server stays safe and observable.

## Behavior

PUT /api/records bodies above 1 MiB are rejected with 413 and a clear
message. GET /health answers 200 without authentication. Re-uploading
an existing record id updates the kind column together with the
ciphertext; created_at stays the original value.

## Acceptance

- Given a record upload above 1 MiB, then the server responds 413 and
  the client shows a size error (EX-HARD-1).
- Given an unauthenticated GET /health, then 200 "ok".
- Given a PUT to an existing id with a different kind, then a following
  GET lists the record under the new kind only.

## Out of scope / notes

Limit via http.MaxBytesReader in the records handler (records are ~200
bytes; 1 MiB is generous headroom). /health on the top-level mux, no
session check. Upsert adds kind to the ON CONFLICT update list. No
schema change; rollback = revert commit. Go tests: oversize, health,
kind-update, created_at preserved.
