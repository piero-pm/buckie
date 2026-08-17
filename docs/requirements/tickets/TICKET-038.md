# TICKET-038: Expected-vs-actual comparison + saved bar

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Month comparison (REQ-29, BR-CMP-1, BR-DASH-2) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 2 — first |
| Depends on | TICKET-036 buckets, TICKET-037 expectations |

## Intent

As a user I want to see, per bucket, whether I am over or under my
plan, and a green bar of what I saved this month.

## Behavior

The month view shows, for each bucket with a non-zero expectation,
actual vs expected with an over/under state — over renders red with the
delta, under or equal renders green. Buckets without an expectation show
actual only. The month view also shows a green "saved" bar: income minus
spend, clamped at zero with a red over-spend callout.

## Acceptance

- Given expected 300 groceries and 420 spent, the bucket renders red
  with +120 (EX-EA-3).
- Given expected 300 and 250 spent, the bucket renders green with the
  remaining amount.
- Given income 2000 and spend 1800, the saved bar shows 200; given
  spend 2100, a red over-spend callout shows instead.

## Out of scope / notes

Pure helper in domain (bucketActual over month items incl. expanded
recurring, vs expectations) unit-tested; ExpectedVsActual component
(progress bars per bucket); SavedBar component replacing nothing
(summary keeps totals). Actual includes recurring expansions per
existing monthlyExpenses.
