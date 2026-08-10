# Delivery Specification: Passwordless Email-Code Login & Session

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-DS-001 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Roadmap outcome 1 (trusted private access + storage). JTBD: log in without a
password and trust that data is private. Benefit: the owner reaches only their
own data with minimal friction and a credible privacy promise. No SMS or password.

## 2. Behavior

The user enters an email address and requests a sign-in code. The system sends a
short-lived numeric code to that email. The user enters the code to establish a
private session. A valid session grants access only to that user's own data.
Signing out ends the session. BR-CONF-1 governs data isolation across users.

## 3. Rules and Examples

Given/When/Then (Gherkin used because flow has clear states):

```gherkin
Scenario: Successful sign-in
  Given a user with a reachable email address
  When they request a code and enter the correct code before it expires
  Then a private session starts and they see only their own data

Scenario: Boundary — code entered at the edge of its validity window
  Given a code was just issued
  When the user submits it within the allowed validity window
  Then sign-in succeeds

Scenario: Negative — wrong code
  Given a user requested a sign-in code
  When they enter an incorrect code
  Then sign-in is refused and no session starts

Scenario: Exception — expired code
  Given a code whose validity window has passed
  When the user submits it
  Then sign-in is refused and the user is invited to request a new code

Scenario: Confidentiality — isolation between users
  Given two users on the same deployment
  When one signs in
  Then they can never see or reach the other user's financial data
```

Additional rules (human decision): code validity window; maximum code attempts
before a new code is required; session lifetime and re-authentication.

## 4. Acceptance Boundary

Confirmed when: a valid code starts a session reaching only the user's own data;
wrong/expired codes are refused; sign-out ends access; a second user cannot reach
the first user's data. Exploratory (human notes): email deliverability, repeated
code requests, and abuse throttling. Verification design is waived to the human.

## 5. Dependencies and Constraints

Prerequisite for all other Epic A behaviors. Confidentiality mechanism (per-user
encryption) is a Lead Developer concern; this spec states the business outcome
only and includes no architecture, data model, or code.

## 6. Exclusions and Open Decisions

Excludes password and SMS login, account recovery beyond re-requesting a code,
and multi-user friend onboarding. Open: code validity window, attempt limit,
session lifetime. Decision owner: human. Blocking: taxonomy-independent; may
proceed once windows are confirmed.

## 7. Traceability and Approval

Source: epic scope §3/§5, roadmap outcome 1, strategy §1 privacy constraint.
Rules: BR-CONF-1. Examples: EX-LOGIN-1..5 in traceability. PO scope check and
human approval pending. This specification is a recommendation.
