# TICKET-033: Import — restore a backup bundle

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Import (REQ-25, BR-IMP-1..4) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 2 — after TICKET-032 |
| Depends on | TICKET-032 bundle format |

## Intent

As a user I want to restore a previously exported backup, so I can
recover after loss or move to a fresh account/server.

## Behavior

Import accepts a bundle file and validates version, structure, and
base64 encoding first; malformed input aborts with a clear message and
writes nothing. When the account already has a vault, the bundle's
verifier must decrypt under the current key — otherwise import is
refused and nothing changes. When the account has no vault, the bundle
envelope is adopted first. Records are then uploaded (merge: locally
newer records remain; on id collision the bundle wins) and the
workspace reloads. Entries: a "Restore from backup instead" branch on
passphrase setup, and a restore button in the Help "Data & safety" card.

## Acceptance

- Fresh account + valid bundle: envelope adopted, records restored,
  original passphrase unlocks (EX-IMP-1).
- Existing vault + bundle from a different passphrase: refused with a
  clear message, nothing changes (EX-IMP-2).
- Existing account + older bundle: newer local records remain,
  colliding ids take the bundle version (EX-IMP-3).
- Malformed file: clear error, nothing written (BR-IMP-1).

## Out of scope / notes

Parse/validate as pure functions in domain/backup.ts (tested); UI in
ImportCard.tsx + the setup-page branch; envelope via existing POST
/api/vault; records via existing PUT. Import runs only from the
unlocked space (existing accounts) or the setup branch (no vault).
