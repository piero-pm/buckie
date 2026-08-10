# Delivery Specification: Daily/Weekly Expense Capture

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-DS-002 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Roadmap outcome 2 (low-friction expense capture). JTBD: record a spend and its
category in seconds. Benefit: sustained capture produces the data all visibility
depends on. Optimised for a phone browser in the moment of spending.

## 2. Behavior

A signed-in user records an expense by entering an amount and choosing a category
from a fixed dropdown (BR-CAT-1). The date defaults to today and can be changed
to a past date. On save, the expense is stored against that user only and appears
in their recent-expenses list, where it can be corrected or removed. Data-quality
rules BR-DQ-1..5 apply. Capture works on iPhone mobile and desktop browsers.

## 3. Rules and Examples

```gherkin
Scenario: Successful capture
  Given a signed-in user on the capture screen
  When they enter a valid amount, pick a category, and save
  Then the expense is stored for today and shown in their recent list

Scenario: Boundary — smallest valid amount and two decimals
  Given a user entering an amount greater than 0 with at most two decimals
  When they save
  Then the expense is accepted

Scenario: Negative — missing category
  Given a user who entered an amount but chose no category
  When they try to save
  Then saving is refused and the missing category is indicated

Scenario: Negative — invalid amount
  Given a user who entered 0, a negative value, or non-numeric text
  When they try to save
  Then saving is refused with a clear reason

Scenario: Exception — likely duplicate
  Given an expense with the same amount, category, and date already exists
  When the user saves another
  Then a duplicate warning is shown but the user may confirm and keep it

Scenario: Boundary — future date rejected
  Given a user sets the expense date after today
  When they try to save
  Then saving is refused; today and past dates are allowed
```

## 4. Acceptance Boundary

Confirmed when: a valid amount + category saves quickly on a phone browser;
invalid amount, empty category, and future date are refused; likely duplicates
warn without blocking; saved items appear only for their owner and can be edited
or deleted. Exploratory: real one-handed speed on a phone. Verification waived.

## 5. Dependencies and Constraints

Depends on login (BA-DS-001) and the approved taxonomy (BR-CAT-1). Currency is a
single Phase 1 value (BR-DQ-2), pending human choice. No architecture, storage
schema, or code is specified here.

## 6. Exclusions and Open Decisions

Excludes user-defined categories, receipt capture, multi-currency, and bulk/CSV
import (Phase 2). Open: final taxonomy, Phase 1 currency, sane maximum amount,
oldest allowed past date, and the duplicate-detection window. Owner: human.

## 7. Traceability and Approval

Source: epic scope §3, roadmap outcome 2. Rules: BR-CAT-1, BR-DQ-1..5. Examples:
EX-CAP-1..6 in traceability. PO scope check and human approval pending. This
specification is a recommendation.
