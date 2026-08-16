# TICKET-024: Honest email failures, resend, change email

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Login scale, part 2 (REQ-23, BR-ERR-1..3) |
| Spec | [../delivery-spec-login-scale.md](../delivery-spec-login-scale.md) |
| Outcome | WORK-003 — honest unhappy paths |
| Sequence | WORK-003 Slice 1 — after TICKET-023 |
| Depends on | TICKET-023 (limits apply to resend) |

## Intent

As a user whose code email never arrives I want to know whether the mail
service failed and to request a fresh code or switch email in place, so a
delivery problem never looks like silent nothing.

## Behavior

If the SMTP sender fails, the API responds with a service-unavailable
message (logged server-side) instead of a false success — today
`_ = sender.Send(...)` swallows the error and the user waits forever. The
frontend auth client surfaces server messages (error or message key) with
case-specific copy: throttle, mail-service failure, network offline. The
code page offers Resend (60-second cooldown, still under the rate
ceilings) and a path back to change the email address.

## Acceptance

- Given the SMTP provider failing, when the user requests a code, then
  they are told the email could not be sent just now (EX-ERR-1).
- Given the code email has not arrived, when the user selects Resend after
  the cooldown, then a fresh code is requested under the same limits
  (EX-ERR-3).
- Given a wrong email address, when the user goes back, then they can
  change it and receive a code at the new address.
- Given a network-level failure, when any auth call fails, then
  connection guidance is shown, distinct from server messages (BR-ERR-2).

## Out of scope / notes

Backend: propagate Send error -> 502 with error body; log detail. No
change to the uniform success response. Frontend: api/auth.ts + CodePage;
vitest for copy and cooldown. Cooldown default adopted at BA gate
(work-state-003 §2).
