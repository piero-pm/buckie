# Delivery Specification: Data Safety — Lock, Backup, Passphrase Change

Status: approved at BA gate 2026-08-16 (all rules; BR-IMP-4 backup-wins confirmed)

| Field | Value |
| --- | --- |
| ID | BA-DS-009 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-16 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Users never lose encrypted data to a lost server, a lost device, or a
voluntary passphrase change, and signing out actually locks the space
(2026-08-16 implementation review; work-state-004 §1).

## 2. Behavior

Signing out clears the cached key; re-entry needs the passphrase. From
the unlocked space the user exports one backup file (vault envelope +
every record ciphertext) and can restore it later, on a fresh account or
over an existing one. The user can change the passphrase: records are
re-encrypted under a new key, envelope replaced last. The server rejects
oversized uploads, answers /health, updates the record kind on
re-upload; UI fixes: EUR hosting copy, empty current month selectable.

## 3. Rules and Examples

BR-LOCK-1: signing out clears the cached key from device storage; the
next entry on that device requires the passphrase.
BR-EXP-1: export produces one JSON file: format version, timestamp, the
vault envelope (salt, KDF params, verifier), and every record's id,
kind, ciphertext (base64).
BR-EXP-2: the bundle is server-blind ciphertext — without the passphrase
the file reveals no amounts, labels, or notes.
BR-IMP-1: import validates version/structure/encoding first; malformed
input aborts with a clear message and writes nothing.
BR-IMP-2: when the account already has a vault, the bundle's verifier
must decrypt under the current key; otherwise import is refused and
nothing changes.
BR-IMP-3: when the account has no vault, the bundle envelope is adopted
and records restored; the bundle's original passphrase then unlocks.
BR-IMP-4: import merges — locally newer records remain; on id collision
the bundle version wins.
BR-PASS-1: passphrase change requires the current passphrase (verified
against the stored verifier) and a new one meeting setup rules
(BA-DS-001: at least 12 alphanumeric characters).
BR-PASS-2: change re-encrypts every record under a new key and
overwrites the envelope last; the user is advised to export first.
BR-PASS-3: a mid-change failure shows a clear error, the user stays on
the page, and the flow can be retried; the client keeps both keys until
the change completes.
BR-HARD-1: record uploads above 1 MiB are rejected with 413.
BR-HARD-2: GET /health answers 200 unauthenticated.
BR-HARD-3: re-uploading a record id updates its kind with its ciphertext.
BR-QW-1: the landing self-hosting copy quotes the hosting cost in EUR.
BR-QW-2: the dashboard month selector always offers the current month,
even with no data yet.

```gherkin
Scenario: Lock on sign-out (EX-LOCK-1)
  Given an unlocked space, when the user signs out and returns on that device
  Then the passphrase is required again

Scenario: Export (EX-EXP-1)
  Given an unlocked space, when the user exports a backup
  Then one JSON file downloads with envelope + all records, no readable amounts

Scenario: Restore on fresh account (EX-IMP-1)
  Given an account with no vault, when importing a bundle
  Then the envelope is adopted, records appear, the original passphrase unlocks

Scenario: Wrong-key bundle refused (EX-IMP-2)
  Given an account with a vault, when importing a different-passphrase bundle
  Then import is refused with a clear message and nothing changes

Scenario: Merge keeps newer records (EX-IMP-3)
  Given records created after the export, when importing that bundle
  Then newer records remain and colliding ids take the bundle version

Scenario: Change keeps data readable (EX-PASS-1)
  Given correct current + valid new passphrase, when the change completes
  Then every record unlocks under the new passphrase on every device

Scenario: Wrong current passphrase (EX-PASS-2)
  Given a wrong current passphrase, when attempting a change
  Then it is refused and nothing is modified

Scenario: Oversized upload (EX-HARD-1)
  Given a record upload above 1 MiB
  Then the server responds 413 and the user sees a size error
```

## 4. Acceptance Boundary

Confirmed when lock, export/import round trip, passphrase change, 413,
and /health behave per scenarios on production. Verification: human,
manual (QA waived) + Go/vitest.

## 5. Dependencies and Constraints

Extends BA-DS-001 (passphrase setup rules). Server remains blind: no new
plaintext, no schema change (envelope overwrite updates the existing
vault row). ADR-002/003 untouched. Bundle size bounded by BR-HARD-1.

## 6. Exclusions and Open Decisions

Excludes: passphrase reset or recovery (impossible by design),
scheduled or offsite backups (deferred), idle auto-lock (WORK-007),
export scheduling/reminders. Resolved at the 2026-08-16 gate: BR-LOCK-1
approved (lock trades same-device convenience); BR-IMP-4 backup-wins;
1 MiB ceiling; import entry placement is UX inline.

## 7. Traceability and Approval

Source: 2026-08-16 implementation review + user direction; work-state-004
§1. Rules BR-LOCK-1, BR-EXP-1..2, BR-IMP-1..4, BR-PASS-1..3, BR-HARD-1..3,
BR-QW-1..2; examples EX-LOCK-1, EX-EXP-1, EX-IMP-1..3, EX-PASS-1..2,
EX-HARD-1. Approved at the BA gate, 2026-08-16.
