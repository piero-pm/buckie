# Delivery Specification: Home Flow, Capture, Prediction Dashboards

Status: approved with WORK-003 plan 2026-08-16 (user-originated intake)

| Field | Value |
| --- | --- |
| ID | BA-DS-008 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-16 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

A returning user lands on one scrollable page: capture a spend at the top,
then the current month against expectation, then a 3/12-month trend with a
future-balance prediction. Capture stays light — "not a bank": general
everyday spending, minimal friction. Benefit: the daily loop and the
insight live on one surface.

## 2. Behavior

First login keeps the existing two-stage onboarding (BA-DS-006).
Subsequent logins open a scrollable home: an add-expense entry at the top;
recent expenses and the income-setup card remain available; scrolling
reaches Dashboard A — the selected month with totals, donut, expected-
expenditure benchmark, and a funnel from income through fixed costs and
other spending to saved — then Dashboard B, a 3/12-month selector showing
average spending, average saving, and a projected balance line. Capture
offers quick-pick chips from the user's most-used categories above the
full dropdown.

## 3. Rules and Examples

BR-HOME-1: onboarding behavior is unchanged (BR-ONB-1/2 stay
authoritative).
BR-HOME-2: the returning home is one scrollable page ordered capture ->
Dashboard A -> Dashboard B; the persistent header and its destinations
are unchanged.
BR-CAP-1: category choice offers quick-pick chips (top 6 from the user's
recorded history, falling back to fixed defaults) plus the existing
searchable dropdown.
BR-TAX-1: expense taxonomy is 14 fixed categories — the existing 8 (Rent,
Bills, Food, Transport & Travel, Health, Shopping, Gift, Miscellaneous)
plus Entertainment & Subscriptions, Personal care, Education & Books,
Pets, Family & Kids, Insurance. Superset: no data migration.
BR-INC-4 (extends BA-DS-006 BR-INC-1): income kinds are salary, freelance,
investments (stocks), other — plus savings kept for existing records.
BR-PRJ-1: Dashboard A shows, for the selected month, spend total, income,
net (unchanged), the donut, an expected-expenditure benchmark from the
average of the last up to 3 months (hidden when no prior month exists —
human chose 3-month average, 2026-08-16), and a funnel income -> fixed
costs (recurring rent and bills) -> other spending -> saved.
BR-PRJ-2: Dashboard B offers a 3- or 12-month window; it shows average
monthly spending, average monthly saving (average income − average
spending — resolves TICKET-015 as income-aware), and a projected balance
line applying the average net forward.
BR-PRJ-3: with fewer than 3 months of history, Dashboard B shows guidance
text instead of projections.

```gherkin
Scenario: Returning user lands ready to spend (EX-HOME-1)
  Given an onboarded user signs in
  Then the home shows add-expense first, then month view, then 3/12-month view

Scenario: Quick category pick (EX-CAP-1)
  Given the user records a spend
  Then their top-6 categories render as one-tap chips above the full dropdown

Scenario: Month expectation (EX-PRJ-1)
  Given a month with at least one prior month
  Then the month view shows the 3-month-average benchmark and the funnel

Scenario: Prediction window (EX-PRJ-2)
  Given at least 3 months of history and a 3- or 12-month selection
  Then averages and the projected balance reflect that window

Scenario: Not enough history (EX-PRJ-3)
  Given fewer than 3 months of history
  Then Dashboard B shows guidance text, no projection
```

## 4. Acceptance Boundary

Confirmed when the home order renders on desktop and iPhone Safari, chips
derive from real history, funnel/trend numbers match unit-tested
aggregation, and projections are income-aware. Verification: human,
manual + vitest.

## 5. Dependencies and Constraints

Depends on BA-DS-004 (dashboard), BA-DS-006 (income/net), and recurring
expansion (BA-DS-003). Projections are client-side over decrypted records
(ADR-002/003). Charts from @mantine/charts; light theme, WCAG 2.2 AA.

## 6. Exclusions and Open Decisions

Excludes: bank/Excel import, investment balance sync, budgets, user-defined
categories. Resolved 2026-08-16: (a) chips + dropdown over the 14-category
taxonomy; (b) funnel + trend both; (c) benchmark = 3-month average.

## 7. Traceability and Approval

Source: user intake 2026-08-16; work-state-003 §1. Rules BR-HOME-1..2,
BR-CAP-1, BR-TAX-1, BR-INC-4, BR-PRJ-1..3; examples EX-HOME-1, EX-CAP-1,
EX-PRJ-1..3. Resolves TICKET-015 (income-aware projection). Approved with
the WORK-003 plan, 2026-08-16.
