# TICKET-050: Dashboard month arrows

Status: approved with WORK-007 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Month prev/next (REQ-34, BR-MTH-1) |
| Spec | [../delivery-spec-navigation-ux.md](../delivery-spec-navigation-ux.md) |
| Outcome | WORK-007 — navigation & UX |
| Sequence | WORK-007 Slice 1 — with TICKET-049 |
| Depends on | TICKET-049 |

## Intent

As a user comparing months I want one-tap prev/next, instead of opening
the selector each time.

## Behavior

The dashboard month selector gains prev/next arrows stepping one month,
data-bounded (gate 2026-08-18): no earlier than the first month with
data, no later than the current month; arrows disable at the bounds.

## Acceptance

- From August, two prev taps render June; next steps back (EX-NU-4).
- Prev disables on the first data month; next disables on the current
  month.

## Out of scope / notes

Bounds reuse the selector's option list (withCurrentMonth basis).
