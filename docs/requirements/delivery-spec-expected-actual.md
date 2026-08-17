# Delivery Specification: Expected vs Actual + Dashboard v2

Status: approved at BA gate 2026-08-17 (16-category table, soft legacy, separate third onboarding stage)

| Field | Value |
| --- | --- |
| ID | BA-DS-010 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-17 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

A first-time user tells myBuckie their starting bank balance and what
they expect to spend on their biggest recurring buckets; from then on
the app shows expected vs actual so overspending is visible early, and
the dashboard reads as one story: record -> this month -> where it leads
-> what was spent. Benefit: budget awareness without bookkeeping
("generic tracker, simple capture" — user intake 2026-08-17).

## 2. Behavior

Onboarding's money step collects the starting balance plus expected
monthly amounts (groceries, going out, shopping; rent, bills and
subscriptions expectations are the user's own manual figures too). An
"Expected" entry in the top bar reopens the same figures anytime. The
month view compares expected vs actual per bucket with clear over/under
rendering. The taxonomy becomes 16 categories grouped in buckets, with
groceries and restaurants separated. The dashboard runs capture ->
month view -> projection -> this month's expense list, shows a green
saved bar, and replaces the funnel with a sankey. The projection line
anchors at the starting balance.

## 3. Rules and Examples

BR-TAX-2: the category taxonomy is 16 categories in four buckets —
Fixed: Rent, Bills, Insurance; Everyday: Groceries, Transport & Travel,
Health, Personal care, Pets; Social: Restaurants & drinks, Entertainment
& culture, Gifts, Family & kids; Lifestyle: Shopping & clothes,
Subscriptions, Education & books, Miscellaneous.
BR-TAX-3: legacy stored values "Food" and "Entertainment & Subscriptions"
remain valid for display and aggregation (bucketed under Everyday and
Social respectively) but are not offered for new capture; edits migrate
them naturally.
BR-EXP-SET-1: expectations are one encrypted record (kind
"expectations"): starting balance + expected monthly amounts for six
buckets — rent, bills, groceries, going out (restaurants + entertainment),
shopping, subscriptions; all manual, none derived from recurring.
BR-EXP-SET-2: onboarding gains a separate third stage ("balance and
expectations") collecting starting balance, groceries, going out, and
shopping (rent/bills/subscriptions optional there); the Expected view
edits all six plus the balance; changes apply immediately to the
comparison view.
BR-CMP-1: the month view shows, per bucket with a non-zero expectation,
actual vs expected with over/under state (over = red, under/equal =
green); buckets without an expectation show actual only.
BR-DASH-1: the home scroll order is capture -> month view (totals,
benchmark, expected-vs-actual, category donut) -> trend/projection ->
this month's expense list (date, category, amount; recurring items
marked).
BR-DASH-2: the month view shows a green "saved" bar: income minus spend,
clamped at zero with a red over-spend callout.
BR-SANK-1: a sankey (recharts, direct use — approved exception) replaces
the funnel: income flows to fixed costs, the expected buckets, other
spend, and saved.
BR-PROJ-2: the trend's cumulative balance and projection start from the
starting balance once set; without one they start from zero (today's
behavior).

```gherkin
Scenario: First run (EX-EA-1)
  Given a new user finishing onboarding
  When they enter a starting balance and the expected amounts
  Then the month view immediately shows expected vs actual for those buckets

Scenario: Revise expectations (EX-EA-2)
  Given an existing user
  When they open Expected from the top bar and lower "going out"
  Then the comparison reflects the new figure for the current month

Scenario: Overspend visible (EX-EA-3)
  Given an expected 300 for groceries and 420 spent
  Then the groceries bucket renders over-budget in red with the delta

Scenario: Old data keeps working (EX-EA-4)
  Given expenses stored with category "Food"
  Then lists, donut, and comparisons still render them after the split
  And new captures no longer offer "Food"

Scenario: Sankey tells the month (EX-EA-5)
  Given income and spending in a month
  Then the sankey shows income splitting into buckets with saved as the
  remaining flow, replacing the funnel

Scenario: Projection anchored (EX-EA-6)
  Given a starting balance of 2000
  Then the trend's cumulative line begins at 2000 and projects forward
```

## 4. Acceptance Boundary

Confirmed when onboarding, Expected view, comparison rendering, sankey,
saved bar, dashboard order, and anchored projection behave per scenarios
on production with real history. Verification: human, manual (QA waived)
+ vitest/Go.

## 5. Dependencies and Constraints

Extends BA-DS-002 (capture/taxonomy), BA-DS-006 (onboarding), BA-DS-008
(dashboards). No server schema change; one new encrypted kind
("expectations") via the existing kind whitelist. Renderer exception:
recharts Sankey used directly under @mantine/charts (human-approved
2026-08-17). Merchant/payment-method/tags dropped from scope.

## 6. Exclusions and Open Decisions

Excludes: per-category expectations beyond the six buckets, alerts or
notifications, budgets rollover, one-off income, income frequency, edit
UIs for recurring/income, recurring endedAt (all later packages). Open
for the gate: the 16-category/bucket table (BR-TAX-2); legacy handling
(BR-TAX-3); onboarding shape — extend the existing money step vs a
separate third step.

## 7. Traceability and Approval

Source: user intake 2026-08-17 (three decisions pre-approved: buckets+
16 split, manual rent/bills/subscriptions, sankey); work-state-005 §1.
Rules BR-TAX-2/3, BR-EXP-SET-1/2, BR-CMP-1, BR-DASH-1/2, BR-SANK-1,
BR-PRJ-2; examples EX-EA-1..6. Approval: human gate pending.
