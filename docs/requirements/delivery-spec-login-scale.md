# Delivery Specification: Login Scale and Honest Errors

Status: approved with WORK-003 plan 2026-08-16 (user-originated intake)

| Field | Value |
| --- | --- |
| ID | BA-DS-007 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-16 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

myBuckie.app supports about 50 users with at least 15 logins in the same
hour, and every failure a user can hit — throttling, email delivery,
network, save failures — produces an honest, actionable message. Benefit:
growth headroom without infrastructure spend; trust through visible
errors instead of silent failure.

## 2. Behavior

Code requests are rate-limited per real client IP (as forwarded by the
reverse proxy) and per email. A throttled request receives a truthful
message naming the wait. If the email service fails, the user is told the
code was not sent. The code page offers Resend and a path back to change
the email address. Every data mutation (save, update, delete, vault)
shows progress and, on failure, a visible error; nothing fails silently.

## 3. Rules and Examples

BR-RL-1: the limiter keys on the client IP from the proxy-forwarded
header when present (Caddy is the only ingress); direct connections fall
back to the socket address.
BR-RL-2: ceilings per rolling hour — 100 per IP, 10 per email
(human-approved 2026-08-16; per-email lowered from 20: anti-bombing +
Resend quota). Responses stay uniform across known and unknown emails
(anti-enumeration).
BR-RL-3: a throttled request returns a truthful message ("too many codes
— try again within the hour"), never a false "a code was sent".
BR-ERR-1: if the email sender fails, the response says so (service
unavailable, try again shortly); the failure is logged server-side.
BR-ERR-2: network-level failures show connection guidance, distinct from
server messages.
BR-ERR-3: the code page offers Resend (60-second cooldown, under BR-RL-2)
and a path back to change the email address.
BR-ERR-4: every mutation surface (add/edit/end/delete for expense,
recurring, income; vault setup/unlock) has a busy state and a visible
failure message; local state changes only after the API succeeds.

```gherkin
Scenario: Morning rush (EX-RL-1)
  Given 15 different users request codes within one hour
  Then all 15 receive their codes (no shared bucket)

Scenario: Shared connection (EX-RL-2)
  Given up to 100 requests from one IP within an hour
  Then each gets a code; the 101st is throttled with the truthful message

Scenario: Throttle honesty (EX-RL-3)
  Given a request beyond the ceiling
  Then the user sees "too many codes requested — try again within the hour"

Scenario: Email service down (EX-ERR-1)
  Given the SMTP provider failing
  Then the user is told the email could not be sent just now

Scenario: Offline save (EX-ERR-2)
  Given the connection drops while saving
  Then a visible error appears; nothing is silently lost or kept

Scenario: Resend (EX-ERR-3)
  Given the code email has not arrived
  Then Resend requests a fresh code under the same limits
```

## 4. Acceptance Boundary

Confirmed when concurrent logins succeed within limits, failure copy
renders per scenarios, and no mutation path fails silently. Verification:
human, manual (QA waived) + Go/vitest.

## 5. Dependencies and Constraints

Extends BA-DS-001 (login/unlock). Server changes limited to auth erroring
and rate keying; no schema changes; ADR-002/003 untouched.

## 6. Exclusions and Open Decisions

Excludes: offsite backups, request-size limits, /health endpoint (deferred
fast-follow candidates, work-state-003 §5). Resolved 2026-08-16: ceilings
100/IP + 10/email; Resend cooldown 60 seconds.

## 7. Traceability and Approval

Source: user intake 2026-08-16; work-state-003 §1. Rules BR-RL-1..3,
BR-ERR-1..4; examples EX-RL-1..3, EX-ERR-1..3. Approved with the WORK-003
plan, 2026-08-16.
