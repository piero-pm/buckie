# Delivery Specification: Spending-Visibility Dashboard

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-DS-004 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Roadmap outcome 4 (spending-visibility dashboard). JTBD: review the month and
name one saving decision. Benefit: capture and recurring data become visible as
month-on-month totals, a category breakdown, and a savings projection.

## 2. Behavior

A signed-in user opens a dashboard showing their own data only (BR-CONF-1). It
presents: (a) total spend for the current month versus prior months; (b) a
spend-by-category breakdown for the selected month, including recurring items;
(c) a savings projection derived from spending trend. Amounts combine one-off
captures and active recurring expenses. Views are responsive for phone and desktop.

## 3. Rules and Examples

```gherkin
Scenario: Successful month-on-month view
  Given a user with expenses across two or more months
  When they open the dashboard
  Then they see each month's total and can compare the current month to prior ones

Scenario: Category breakdown includes recurring
  Given one-off and recurring expenses in the selected month
  When the user views the category breakdown
  Then each category total includes both one-off and recurring amounts

Scenario: Boundary — first month with no prior data
  Given a user in their first month of use
  When they open the dashboard
  Then the current month is shown and comparison indicates no prior month yet

Scenario: Negative/empty — no expenses captured
  Given a user who has captured nothing
  When they open the dashboard
  Then totals show zero and the projection indicates insufficient data

Scenario: Savings projection
  Given at least the minimum history the projection needs
  When the user views the projection
  Then a forward savings estimate is shown with its basis stated
```

## 4. Acceptance Boundary

Confirmed when: totals reconcile with captured + active recurring expenses for
each month; the category breakdown sums to the month total; empty and first-month
states are handled; the projection states its basis and its insufficient-data
case. Exploratory: whether the projection actually prompts a saving action.

## 5. Dependencies and Constraints

Depends on capture (BA-DS-002) and recurring (BA-DS-003) data and on login
(BA-DS-001). Chart visuals and layout are UX detail folded into build; this spec
names content, not visual design, and includes no architecture or code.

## 6. Exclusions and Open Decisions

Excludes budgets/targets, export, and the Epic B guidance advice. Open (human
decision): the savings-projection method and whether it needs an income or
savings-target input; minimum history before a projection is shown; default
month selection. Owner: human.

## 7. Traceability and Approval

Source: epic scope §3, roadmap outcome 4. Rules: BR-CONF-1, BR-REC-1, BR-CAT-1.
Examples: EX-DASH-1..5 in traceability. PO scope check and human approval pending.
This specification is a recommendation.
