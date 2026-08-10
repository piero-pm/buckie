# TICKET-004: Per-user data confidentiality

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| Behavior | Confidentiality (REQ-3, BR-CONF-1) |
| Spec | [../delivery-spec-login.md](../delivery-spec-login.md) |
| Outcome | Roadmap outcome 1 — trusted private access |
| Sequence | 4 of 15 |
| Depends on | TICKET-002 |

## Intent

As the owner and self-hoster, I need each user's financial data isolated, so that
on a multi-user deployment no user (or the host) can read another user's money data.

## Behavior

Every expense, recurring item, and dashboard view is attributed to and visible to
only its owning user. A signed-in user can never reach another user's financial
data through any screen. This ticket states the business/privacy outcome; the
protection mechanism (per-user encryption) is defined by the Lead Developer.

## Acceptance

- Given two users on one deployment, when one is signed in, then they see only
  their own expenses, recurring items, and dashboard (EX-LOGIN-5).
- Given a signed-in user, when they attempt to reach another user's data by any
  in-app path, then access is denied.
- Given a multi-user host, when data is stored, then one user's financial data is
  not readable as another user's (mechanism per Lead Developer).

## Out of scope / notes

Encryption design, key handling, and storage are Lead Developer concerns and are
deliberately excluded here. Recommendation awaiting human approval.
