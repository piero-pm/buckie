# TICKET-023: Client-IP rate limiting and honest throttle

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Login scale, part 1 (REQ-23, BR-RL-1..3) |
| Spec | [../delivery-spec-login-scale.md](../delivery-spec-login-scale.md) |
| Outcome | WORK-003 — 50 users, 15+ logins/hour |
| Sequence | WORK-003 Slice 1 — first |
| Depends on | BA-DS-001 login flow (in place) |

## Intent

As the owner I want code requests limited per real client network instead of
one shared bucket, so 15+ users can log in within the same hour and a
throttled user is told the truth instead of a false "a code was sent".

## Behavior

Behind Caddy every request currently appears as 127.0.0.1, so the per-IP
cap is global (5/hour for everyone — production defect, work-state-003
§1). The limiter keys on the client IP taken from the proxy-forwarded
header when present (Caddy is the only ingress; direct connections fall
back to the socket address). Ceilings per rolling hour: 100 per IP, 10 per
email. A throttled request returns a truthful message naming the wait;
responses stay uniform across known and unknown emails (anti-enumeration).

## Acceptance

- Given 15 different users request codes within one hour, then all 15
  receive codes (EX-RL-1).
- Given up to 100 requests from one IP within an hour, then each gets a
  code; the 101st is throttled with the truthful message (EX-RL-2).
- Given a request beyond either ceiling, when the user asks for a code,
  then they see the truthful wait message, never a false sent claim
  (EX-RL-3).
- Given an unknown email, when throttled or served, then responses are
  indistinguishable from a known email (BR-RL-2).

## Out of scope / notes

Backend-only (auth). No schema change. Go tests: forwarded-IP keying,
fallback behavior, both ceilings, 429 body shape, uniformity. Rate entries
still lack eviction (WORK-001 follow-up) — unchanged here.
