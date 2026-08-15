# Delivery Specification: Income Sources, Onboarding, Dashboard Income

Status: approved with WORK-002 plan 2026-08-16 (user-originated intake)

| Field | Value |
| --- | --- |
| ID | BA-DS-006 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-16 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

A complete monthly picture: income sources (salary, savings contributions,
stock investments) alongside expenses, with first-run education so a new user
understands how Buckie works and how privacy is protected before entering any
income. Benefit: net position becomes visible; trust is earned before data
is captured.

## 2. Behavior

A signed-in unlocked user registers income sources: a kind (salary, savings,
investment), a monthly amount, an optional label, and an optional day-of-month.
Sources contribute to every month automatically until ended and are editable
anytime from the Income section. On unlock with an empty income register, a
two-stage onboarding runs: stage 1 explains how Buckie works and its
privacy/encryption model; stage 2 collects income sources with a Skip action.
Skipping leaves a dismissible hub card linking to the Income section. The
dashboard shows monthly income total and net (income − expenses) beside the
existing charts.

## 3. Rules and Examples

BR-INC-1: income kinds are fixed — salary, savings, investment (stocks) —
plus an optional free-text label.
BR-INC-2: monthly amount > 0, at most 2 decimals, at most 1,000,000 (mirrors
BR-DQ); day-of-month 1..31, clamped to month end (mirrors BR-REC).
BR-INC-3: ending a source stops future months; past months are unchanged
(mirrors BR-REC semantics).
BR-ONB-1: the two-stage onboarding runs after unlock while the income
register is empty; stage 1 always precedes any income entry.
BR-ONB-2: Skip exits onboarding and leaves a dismissible hub card until a
source exists; stage 1 is not re-shown after Skip (Help keeps the content).

```gherkin
Scenario: Register a salary source (EX-INC-1)
  Given a signed-in unlocked user
  When they add an income source with kind salary and a valid monthly amount
  Then it is recorded encrypted and counts toward the current and later months

Scenario: Invalid amount refused (EX-INC-2)
  Given the income add form
  When the user enters 0 or a negative or over-limit amount
  Then saving is refused with a clear reason

Scenario: Ending a source (EX-INC-3)
  Given an active income source
  When the user ends it
  Then future months exclude it and past months keep it unchanged

Scenario: Editable anytime (EX-INC-4)
  Given a user with income sources
  When they open the Income section later
  Then they can add, edit, or end sources at any time

Scenario: Two-stage onboarding (EX-ONB-1)
  Given a user who just unlocked with an empty income register
  When onboarding starts
  Then stage 1 explains how Buckie works and privacy/encryption
  And stage 2 collects salary, savings, and investment sources

Scenario: Skip (EX-ONB-2)
  Given onboarding stage 2
  When the user skips
  Then they land on the hub with a dismissible income-setup card
  And stage 1 is not shown again on later unlocks

Scenario: Dashboard net (EX-DASH-6)
  Given a month with income sources and expenses
  When the user views the dashboard
  Then monthly income total and net (income − expenses) are shown
```

## 4. Acceptance Boundary

Confirmed when sources register/validate/end correctly, onboarding stages
behave per BR-ONB-1/2, and the dashboard shows income + net. Verification:
human, manual (QA waived).

## 5. Dependencies and Constraints

Depends on BA-DS-001 (login/unlock) and the record semantics of BA-DS-003
(monthly expansion, end semantics). Income uses the same encrypted records
channel: the server stores only ciphertext (ADR-002/ADR-003, BR-CONF-1).

## 6. Exclusions and Open Decisions

Excludes investment balance API sync (future, needs human approval — recorded
in work-state-002 §2), payslip-variability, taxes, and multi-currency. Open:
none blocking — investment sources store a monthly figure now and are
structured so provider/symbol can attach later.

## 7. Traceability and Approval

Source: user intake 2026-08-15/16; work-state-002 §2. Rules BR-INC-1..3,
BR-ONB-1..2. Examples EX-INC-1..4, EX-ONB-1..2, EX-DASH-6. Approved with the
WORK-002 plan, 2026-08-16.
