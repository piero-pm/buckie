# Delivery Specification: Recurring Monthly Fixed Expenses

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-DS-003 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Roadmap outcome 3 (recurring fixed expenses). JTBD: register known monthly costs
once so the monthly picture is complete and accurate. Benefit: fixed costs
(e.g. rent, subscriptions) are counted every month without re-entry.

## 2. Behavior

A signed-in user registers a recurring monthly expense with an amount, a category
(BR-CAT-1), and a day-of-month it applies. The item then contributes to every
month automatically (BR-REC-1) until the user ends it. The user can edit its
amount/category or stop it; stopping affects future months and preserves past
months. Recurring items are attributed to that user only (BR-CONF-1).

## 3. Rules and Examples

```gherkin
Scenario: Successful registration
  Given a signed-in user
  When they add a recurring expense with a valid amount and category
  Then it is recorded and counts toward the current and following months

Scenario: Boundary — day-of-month beyond a short month
  Given a recurring expense set to the 31st
  When a month has fewer than 31 days
  Then it is applied on that month's last day rather than skipped

Scenario: Negative — invalid recurring amount
  Given a user enters 0, a negative value, or no category
  When they try to save the recurring expense
  Then saving is refused with a clear reason

Scenario: Exception — ending a recurring expense
  Given an active recurring expense
  When the user ends it
  Then future months exclude it and past months keep it unchanged

Scenario: Edit — change amount going forward
  Given an active recurring expense
  When the user changes its amount
  Then future months use the new amount and past months are unchanged
```

Open rule (human decision): whether editing an amount applies from the current
month or the next month.

## 4. Acceptance Boundary

Confirmed when: a valid recurring item is registered once and appears in the
current and later months; invalid amount/category is refused; end-date stops
future months without altering history; short-month handling is predictable.
Exploratory: long-run accumulation over many months. Verification waived.

## 5. Dependencies and Constraints

Depends on login (BA-DS-001) and shares the taxonomy and data-quality rules of
capture (BA-DS-002). Feeds the dashboard (BA-DS-004). No architecture, scheduling
mechanism, storage schema, or code is specified here.

## 6. Exclusions and Open Decisions

Excludes weekly/annual recurrence, variable-amount bills, and reminders. Open:
edit-effective timing (current vs next month), and whether a recurring item may
be paused rather than ended. Owner: human.

## 7. Traceability and Approval

Source: epic scope §3, roadmap outcome 3. Rules: BR-REC-1, BR-CAT-1, BR-DQ-1/2/4.
Examples: EX-REC-1..5 in traceability. PO scope check and human approval pending.
This specification is a recommendation.
