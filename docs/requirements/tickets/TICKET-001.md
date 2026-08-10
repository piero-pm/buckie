# TICKET-001: Request a sign-in code by email

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| Behavior | Passwordless login (REQ-1) |
| Spec | [../delivery-spec-login.md](../delivery-spec-login.md) |
| Outcome | Roadmap outcome 1 — trusted private access |
| Sequence | 1 of 15 |
| Depends on | None |

## Intent

As the owner, I enter my email and request a one-time sign-in code, so I can
begin signing in without a password.

## Behavior

The user provides an email address and requests a code. The system issues a
short-lived numeric code to that address and tells the user a code was sent. No
password or SMS path exists. Requesting a code for an unknown email behaves the
same way to avoid revealing who has an account.

## Acceptance

- Given a user on the sign-in screen, when they enter an email and request a
  code, then they are told a code was sent.
- Given a malformed email, when they request a code, then the request is refused
  with a clear reason and no code is sent.
- Given repeated requests, when a new code is issued, then only the latest code
  is valid (earlier codes stop working).

## Out of scope / notes

Code validity window and attempt limit are open human decisions (flagged in the
spec). No email-delivery mechanism, storage, or code is specified here. This
ticket is a recommendation awaiting human approval.
