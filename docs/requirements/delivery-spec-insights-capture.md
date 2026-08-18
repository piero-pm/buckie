# Delivery Specification: Insights + Capture Completeness

Status: approved at BA gate 2026-08-18 (occurrences, typed eventKind, legacy ends invisible, old list removed)

| Field | Value |
| --- | --- |
| ID | BA-DS-011 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-18 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

A user with months of history can find any expense (filter, search), see
when and on what they spend (heatmap, trends), record non-salary money
in (events, non-monthly frequencies), and correct what they recorded
(recurring end, income, notes). Benefit: the tracker covers real money
life, not just the monthly happy path.

## 2. Behavior

The Expenses view becomes the expense browser — month selector, category
filter, text search over note + category — superseding the flat "recent"
list. The dashboard gains a trailing-12-month spend-calendar heatmap and
per-category 12-month trend lines. Income gains one-off events (new
encrypted kind) and non-monthly frequencies counted by occurrence.
Recurring "End" becomes history-preserving via `endedAt`; income sources
and expense notes become editable.

## 3. Rules and Examples

BR-LST-1: the Expenses view lists one-off + recurring-generated items
for a chosen month (default current), filterable by category (incl.
legacy in use) and free text over note + category; controls compose.
BR-HMAP-1: the heatmap shows trailing-12-month daily spend totals (same
aggregation as lists; recurring on its day of month); darker = more.
BR-TRD-1: trend lines plot 12 months of monthly totals per category,
multi-select, default the four buckets rolled up; legacy maps like donut.
BR-IOFF-1: a one-off income event is an encrypted record (kind
"income_event": id, amount, date, eventKind bonus|gift|refund|other,
note optional) counted as income in its month; invalid kinds rejected
server-side like other kinds.
BR-INC-FREQ-1: income sources gain frequency monthly|weekly|quarterly|
yearly (default monthly, existing records unchanged); `amount` is
per-period and a month counts actual occurrences: weekly pays every
occurrence of its weekday (picked at creation, default the creation
weekday) from the creation month; quarterly/yearly pay every third/
twelfth month from the creation month, on dayOfMonth clamped.
BR-REC-END-1: ending a recurring sets `endedAt` (month of the end) and
keeps history — the template still generates for months <= endedAt;
records already ended the old way (active:false, no endedAt) stay
invisible in all months (their true end month is unknowable; no
fabricated history).
BR-EDIT-1: EditExpense gains an optional editable note; IncomePage rows
gain edit (amount, kind, label, frequency, day) with creation-time
validation; recurring rows stay end/remove only.

| ID | Given | When | Then |
| --- | --- | --- | --- |
| EX-IC-1 | expenses across months | pick a month, filter "Groceries", type "lidl" | only matching rows show, with date, note, amount |
| EX-IC-2 | a 500 bonus event in June | June renders | income, saved bar, sankey include it |
| EX-IC-3 | a weekly source of 500 paying Tuesdays | a month renders | 4 Tuesdays count 2000; 5 count 2500 |
| EX-IC-4 | a gym recurring since March ended in July | months render | March..July show it; August onward does not |
| EX-IC-5 | an expense with a wrong note | the note is edited and saved | lists and searches reflect the new text |

## 4. Acceptance Boundary

Confirmed when browser, heatmap, trends, events, proration, and edits
behave per scenarios on production with real history. Human verifies
manually (QA waived) + vitest/Go.

## 5. Dependencies and Constraints

Extends BA-DS-002/006/008/010. One new encrypted kind ("income_event")
via the existing server whitelist. Charts from installed @mantine/charts.

## 6. Exclusions and Open Decisions

Excludes: budgets/alerts (absorbed by WORK-005 expected), investment API
sync, recurring amount/category editing. Resolved at the gate 2026-08-18:
actual occurrences; typed eventKind; legacy ends invisible; old list
removed. Trend default (buckets) stands; Lead may adjust at direction.

## 7. Traceability and Approval

Source: user intake 2026-08-18 (kickoff; WORK-005 §5 displaced ledger).
Rules BR-LST-1, BR-HMAP-1, BR-TRD-1, BR-IOFF-1, BR-INC-FREQ-1,
BR-REC-END-1, BR-EDIT-1; examples EX-IC-1..5. Approval: human gate
passed 2026-08-18.
