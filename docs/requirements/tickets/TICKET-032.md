# TICKET-032: Export encrypted backup bundle

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Export (REQ-25, BR-EXP-1..2) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 2 — first |
| Depends on | None |

## Intent

As a user I want a downloadable backup of everything the server stores
for me, so server or device loss never means data loss.

## Behavior

From the unlocked space (Help page, new "Data & safety" card) the user
downloads one JSON file: format version, export timestamp, the vault
envelope (salt, KDF params, verifier), and every record's id, kind, and
base64 ciphertext. The file contains no readable amounts, labels, or
notes.

## Acceptance

- Given an unlocked space, when the user exports, then one JSON file
  downloads containing the envelope and all records, and the file's raw
  text contains no plaintext amounts (EX-EXP-1).
- Given the bundle, then re-parsing it yields exactly the server's
  envelope and record set.

## Out of scope / notes

api/records.ts gains a raw list path (GET /api/records already returns
ciphertext; no decrypt). Bundle assembly as a pure function
(domain/backup.ts, unit-tested) with a Blob download helper; filename
buckie-backup-YYYYMMDD-HHMM.json. Help page section extracted to
BackupCard.tsx to keep files under 200 lines. No scheduling/reminders.
