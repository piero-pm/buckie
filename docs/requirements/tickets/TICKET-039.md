# TICKET-039: Dashboard reorder + month expense list

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Dashboard order + month list (REQ-29, BR-DASH-1) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 2 — after TICKET-038 |
| Depends on | TICKET-038 comparison block |

## Intent

As a user I want the home scroll to tell one story — record, this
month, where it leads, what I spent — ending with the month's expense
list.

## Behavior

The home scroll order becomes: capture entry, month view (totals,
benchmark, expected-vs-actual, donut), trend/projection, then this
month's expense list — one-off and recurring-generated items of the
selected month, date-desc, with recurring items marked.

## Acceptance

- Given the home scroll, the sections appear in that order.
- Given a month with one-off and recurring items, the list shows both,
  recurring marked, date-desc, amounts summing to the month total.

## Out of scope / notes

MonthExpenseList component fed by monthlyExpenses(expenses,
expandRecurring(...), selected); recurring items identified by the
synthetic id prefix "templateId:". HubView/DashboardPage restructure;
keep file sizes <=200 (extract as needed). No pagination.
