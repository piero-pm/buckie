# TICKET-043: Income frequency + income edit

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Income frequency by occurrences + source editing (REQ-33, BR-INC-FREQ-1, BR-EDIT-1 income part) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 1 — after TICKET-042 |
| Depends on | TICKET-042 (monthIncome signature) |

## Intent

As a user paid weekly, quarterly, or yearly I want the month to count
what actually lands in it, and I want to fix mistakes in a source.

## Behavior

Sources gain frequency monthly|weekly|quarterly|yearly (default monthly;
existing records unchanged) and weekly sources carry a payday weekday
(default the creation weekday). monthIncome counts actual occurrences:
weekly = occurrences of the weekday in the month (from the creation
month); quarterly/yearly = every third/twelfth month from the creation
month, on dayOfMonth clamped. Income rows become editable (amount, kind,
label, frequency, day/weekday) with creation-time validation.

## Acceptance

- Given a weekly source of 500 paying Tuesdays, a month with 4 Tuesdays
  counts 2000 and one with 5 counts 2500 (EX-IC-3).
- Given a quarterly source created in March, it counts in March, June,
  September, December only.
- Editing a source's amount updates every affected month immediately.

## Out of scope / notes

monthIncome moves occurrence logic into domain/income.ts helpers
(weekday count, month stride) for unit tests; aggregation imports them.
