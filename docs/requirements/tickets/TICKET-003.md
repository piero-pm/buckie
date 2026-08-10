# TICKET-003: Session lifetime and sign out

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| Behavior | Session management (REQ-2) |
| Spec | [../delivery-spec-login.md](../delivery-spec-login.md) |
| Outcome | Roadmap outcome 1 — trusted private access |
| Sequence | 3 of 15 |
| Depends on | TICKET-002 |

## Intent

As the owner, I stay signed in across visits and can sign out, so my access is
convenient but under my control.

## Behavior

An established session persists for a defined lifetime so the user need not
re-enter a code on every visit. Signing out ends the session immediately. After
sign-out or expiry, reaching private data requires signing in again.

## Acceptance

- Given a signed-in user, when they return within the session lifetime, then they
  reach their data without re-entering a code.
- Given a signed-in user, when they sign out, then the session ends and private
  data is no longer reachable until they sign in again.
- Given an expired session, when the user acts, then they are asked to sign in
  again.

## Out of scope / notes

Session lifetime value is an open human decision. No token/storage mechanism is
specified. Recommendation awaiting human approval.
