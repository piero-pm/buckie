# TICKET-044: Expense browser

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Month/category/text browsing (REQ-31, BR-LST-1) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 2 — first |
| Depends on | none |

## Intent

As a user with months of records I want to find any expense by month,
category, or text, instead of scrolling a flat recent list.

## Behavior

The Expenses view becomes a browser: a month selector (default current,
any month with data plus current), a category filter (editable taxonomy
+ legacy values in use), and a text search over note + category. The
three controls compose (month AND category AND text). Rows keep date,
category, note, amount, recurring badge, and the edit/delete actions.
The flat "Recent expenses" behavior is removed (gate 2026-08-18).

## Acceptance

- Given expenses across months, picking a month, filtering Groceries,
  and typing "lidl" shows only matching rows (EX-IC-1).
- Empty result states read clearly; counts update with filters.

## Out of scope / notes

Reuse MonthExpenseList's row rendering; filtering pure + unit-tested
(domain helper), UI thin. EditExpense stays the row editor.
