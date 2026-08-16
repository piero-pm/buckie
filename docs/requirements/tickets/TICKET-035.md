# TICKET-035: Passphrase change flow

Status: approved with WORK-004 direction 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Passphrase change (REQ-26, BR-PASS-1..3) |
| Spec | [../delivery-spec-data-safety.md](../delivery-spec-data-safety.md) |
| Outcome | WORK-004 — data safety |
| Sequence | WORK-004 Slice 3 — after TICKET-034 |
| Depends on | TICKET-034 endpoint; TICKET-032 export prompt |

## Intent

As a user I want to change my encryption passphrase safely, so I can
rotate a shared or aging secret without losing my data.

## Behavior

From the Help "Data & safety" card the user enters the current
passphrase; it is verified against the stored verifier (wrong →
refused, nothing modified). The flow then advises exporting a backup
first, collects a new passphrase plus confirmation under the setup
rules, derives a new key from a fresh salt, re-encrypts every record
(retry on transient failure), and finally PUTs the new envelope — last.
The cached key is replaced. A mid-change failure shows a clear error,
keeps the user on the page, and the flow remains retryable; the client
holds both keys until completion.

## Acceptance

- Correct current + valid new passphrase: every record stays readable
  under the new passphrase on every device (EX-PASS-1).
- Wrong current passphrase: refused, nothing modified (EX-PASS-2).
- Failure at record N: clear error shown, flow resumable, no silent
  partial state presented as success (BR-PASS-3).

## Out of scope / notes

Re-encrypt helper as a pure, unit-tested function; UI extracted
(PassphraseChangeCard.tsx). Order matters: envelope last. Known edge:
other devices with a cached old key fail decryption after a change;
their path is sign-out (clears the key, TICKET-031) then unlock with
the new passphrase — surfaced via the existing decrypt-failure toast.
No reset/recovery, no scheduled rotation.
