# TICKET-002: Verify code and start a private session
Status: Shipped (WORK-001..005; closed as shipped WORK-007, 2026-08-19)

| Field | Value |
| --- | --- |
| Behavior | Passwordless login (REQ-1) |
| Spec | [../delivery-spec-login.md](../delivery-spec-login.md) |
| Outcome | Roadmap outcome 1 — trusted private access |
| Sequence | 2 of 15 |
| Depends on | TICKET-001 |

## Intent

As the owner, I enter the code I received, so I can start a private session and
reach only my own data.

## Behavior

The user submits the code. A correct code within its validity window starts a
session scoped to that user. An incorrect or expired code is refused; the user
can request a new one.

## Acceptance

- Given a valid, unexpired code, when the user submits it, then a private session
  starts and they reach only their own data.
- Given the edge of the validity window, when the code is submitted within it,
  then sign-in succeeds (EX-LOGIN-2).
- Given a wrong code, when submitted, then sign-in is refused and no session
  starts (EX-LOGIN-3).
- Given an expired code, when submitted, then sign-in is refused and the user is
  invited to request a new code (EX-LOGIN-4).

## Out of scope / notes

Attempt limit and lockout policy are open human decisions. No architecture or
code here. Recommendation awaiting human approval.
