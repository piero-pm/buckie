# TICKET-045: History-preserving recurring end

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Recurring endedAt end (REQ-33, BR-REC-END-1) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 2 — after TICKET-044 |
| Depends on | none |

## Intent

As a user ending a subscription I want past months to keep showing it;
today the end erases it from history.

## Behavior

"End" on a recurring item sets `endedAt` to the current yyyy-mm (plus
active:false) and the template still generates for every month
<= endedAt. Records already ended the old way (active:false, no
endedAt) stay invisible in all months — their true end month is
unknowable and history is not fabricated (gate 2026-08-18). The list
shows the ended month on the badge.

## Acceptance

- Given a gym recurring since March ended in July, March..July still
  show it and August onward does not (EX-IC-4).
- Given a legacy active:false item without endedAt, no month shows it
  (status quo).

## Out of scope / notes

Aggregation's recurring expansion changes from skip-if-inactive to
skip-if-past-endedAt (with the legacy guard). Ended items still removable
(existing trash action).
