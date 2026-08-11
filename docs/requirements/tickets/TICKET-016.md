# TICKET-016: Set up an encryption passphrase

Status: approved 2026-08-10 (work-state §2); status reconciled 2026-08-11

| Field | Value |
| --- | --- |
| Behavior | Encryption-passphrase setup (REQ-16, BR-PASS-1/2) |
| Spec | [../delivery-spec-login.md](../delivery-spec-login.md) |
| Outcome | Roadmap outcome 1 — trusted private access + storage |
| Sequence | Outcome 1 confidentiality — after TICKET-004, before TICKET-005 |
| Depends on | TICKET-002 |

## Intent

As the owner, I set a private encryption passphrase after signing in and before I
store any money data, so that only I — holding that passphrase — can ever read my
financial data, and the host cannot. Login proves who I am; this passphrase keeps
my data confidential.

## Behavior

After a user first establishes a session (TICKET-002) and has no passphrase yet,
they are prompted to create one before any expense can be stored. The passphrase
is separate from login and is entered in the browser; it unlocks a private
workspace by deriving the data key that protects the user's records. The server
never receives the passphrase or the derived key — only ciphertext (mechanism per
[ADR-002](../adr/ADR-002.md) and [ADR-003](../adr/ADR-003.md)). On the same
device the unlocked key is cached, so no re-entry is needed on return; on a new
device or after the cache is cleared, the user must re-enter the passphrase to
unlock. Because there is no server-side recovery, setup makes the user explicitly
aware that a lost passphrase means their stored data becomes permanently
unreadable, and the user acknowledges this before finishing.

## Acceptance

- Given a signed-in user with no passphrase yet, when they set a compliant
  passphrase (at least 12 alphanumeric characters), then it is accepted and their
  private workspace is unlocked, ready to store data (EX-PASS-1).
- Given the same setup prompt, when the user enters a passphrase that does not
  meet the rule (for example fewer than 12 characters), then setup refuses it and
  explains the requirement, and no workspace is unlocked (EX-PASS-2).
- Given a user who has already set a passphrase and unlocked on this device, when
  they return on the same device, then the cached key unlocks the workspace and no
  passphrase re-entry is required (EX-PASS-3).
- Given a user with a passphrase who returns on a new device or after the device
  cache is cleared, when they enter the correct passphrase, then the workspace
  unlocks; when they enter an incorrect passphrase, then it does not unlock and no
  data is revealed (EX-PASS-4).
- Given a user setting up their passphrase, when they complete setup, then they
  have been made explicitly aware and have acknowledged that if the passphrase is
  lost there is no recovery and stored data becomes permanently unreadable
  (EX-PASS-5).
- Given any point in setup or unlock, when the passphrase is entered, then the
  server never receives the passphrase or the derived key; only ciphertext is
  stored (confidentiality outcome; mechanism per ADR-002/ADR-003).

## Out of scope / notes

KDF choice, cipher, library, key-caching, and salt handling are Lead Developer
concerns fixed in ADR-002/ADR-003 and are deliberately excluded here. This ticket
states the business behavior only. Must precede expense capture (TICKET-005) so no
plaintext is ever persisted. Approved 2026-08-10; status reconciled 2026-08-11.
