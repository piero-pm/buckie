# Work State: Expected vs Actual + Dashboard v2

| Field | Value |
| --- | --- |
| ID | WORK-005 |
| Status | Running — Business Analyst |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Business Analyst |
| Next owner | Human (BA material-rule gate) |
| Updated | 2026-08-17 |

## 1. Request and Route

(1) Onboarding additionally asks a one-off starting bank balance and
expected monthly spend for groceries, restaurants/drinks (social), and
shopping/clothes; rent, bills, and subscriptions expectations are manual
too. (2) An "Expected" entry on the top bar re-opens the expectations
anytime. (3) The month view gains an expected-vs-actual comparison over
six buckets: rent, bills, groceries, going out, shopping, subscriptions.
(4) Taxonomy splits to 16 categories in a buckets+subcategories
structure (groceries and restaurants separated; Entertainment &
Subscriptions split). (5) Dashboard reorders to capture -> month view ->
projection -> this month's expense list, with a green saved bar.
(6) A sankey chart replaces the funnel; the projection anchors at the
starting balance. Merchant/payment-method/tags fields are dropped from
scope (generic tracker, simple capture).

Route: user-originated intake (PO satisfied by direct human request,
WORK-003/004 precedent) -> Business Analyst (BA-DS-010) -> Lead Developer
(slice direction) -> Developer. UX folded inline; QA waived (human
verifies manually) per WORK-001 standing waivers.

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction: expected vs actual + dashboard v2 | Human | Approved | Review + WORK-004 closure thread, 2026-08-17 |
| Taxonomy buckets + 16 categories, groceries/restaurants split | Human | Approved | User: "Split categories and make as needed 16", 2026-08-17 |
| Rent/bills/subscriptions expectations manual (not from recurring) | Human | Approved | User: "comes from my idea of what I want", 2026-08-17 |
| Sankey chart approved (recharts direct use, interface exception) | Human | Approved | User: "sankey i want it", 2026-08-17 |
| BA-DS-010 remaining material rules | Human | Approved | AskUser gate 2026-08-17: 16-category table, soft legacy, separate third stage |
| Slice direction + tickets (S1 036/037, S2 038/039, S3 040/041) | Human | Approved | AskUser answer, 2026-08-17 (start S1) |
| UX stage | Human | Waived | Standing waiver WORK-001 (UX inline) |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |
| Slice pushes (production deploy) | Human | Pending | Per-slice gates |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope §1 (3 decisions pre-approved) | BA elaborates |
| Business Analyst | Passed | BA-DS-002/006/008 + intake | BA-DS-010 approved; traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved BA-DS-010 | Slice direction + TICKET-036..041 approved | Developer starts S1 |
| Developer | Passed | Tickets 036-041 | S1 17b1772, S2 763c2c7, S3 (this commit) — all gates green | Push approval + human verification |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices (Lead confirms at direction gate): S1 = taxonomy 16 + buckets +
expectations record + onboarding + Expected view; S2 = expected-vs-actual
chart + saved bar + dashboard reorder + month expense list; S3 = sankey
+ projection anchor. Gate = frontend lint/prettier/vitest/build +
backend go build/vet/gofmt/test (if touched) + clean-artifacts sizes
(mirror WORK-004 §4). Push needs human approval (production deploy).

Manual production verification: onboarding money step, expected editing
from the top bar, expected-vs-actual over/under rendering, sankey with
real history, saved bar, dashboard order, iPhone Safari.

### 4.1 Slice 1 gate evidence (2026-08-17, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; 37/37 tests incl. expectations-kind
round-trip. Frontend: eslint + prettier clean; 110/110 vitest incl. 8
new (taxonomy 16/buckets/legacy x3, expectations validation + record
building x6, onboarding third-stage flow x1; quick-pick defaults updated
to the new taxonomy order); tsc + build green. Sizes: all <=200
(taxonomy.ts 105, expectations.ts 91, ExpectationsForm 123,
OnboardingPage 137, ExpectedPage 47, useWorkspace 120, api/records 129).
Design note: soft legacy (BR-TAX-3) covers all six dropped values (the
approved table also renames Gift/Family & Kids/Shopping/Education &
Books), so byCategory now includes legacy categories only when used —
old records keep appearing in the donut; edit selects gain a Legacy
group only when the record's value is legacy.

### 4.2 Slice 2 gate evidence (2026-08-17, local ZCode/GLM-5.2)

Frontend only: eslint + prettier clean; 116/116 vitest incl. 6 new
(compareBuckets x4 incl. legacy mapping + overspend flag, savedThisMonth
x2; home-scroll order test updated to BR-DASH-1); tsc + build green.
Sizes: comparison.ts 82, ExpectedVsActual 61, SavedBar 41,
MonthExpenseList 57, DashboardPage 162, HubView 88 — all <=200. Lead
call recorded: the old hub "Recent" block is removed — superseded by
the month expense list closing the scroll (BR-DASH-1's exact order);
legacy categories approximate into buckets (Food->groceries,
Entertainment & Subscriptions->going out) per code comment in
comparison.ts.

### 4.3 Slice 3 gate evidence (2026-08-17, local ZCode/GLM-5.2)

Frontend only: eslint + prettier clean; 118/118 vitest incl. 4 new
(monthFlows x3: full distribution incl. income conservation, zero-flow
omission + legacy mapping + negative saving, empty month; cumulativeNet
anchored x1) and monthFunnel tests removed with the function;
tsc + build green. recharts 2.15.4 added as an explicit dependency
(already transitively present via @mantine/charts; open source, zero
cost — interface exception recorded in §2). Sizes: flows.ts 75,
SankeyFlow 90, DashboardPage 162, TrendView 138, prediction.ts 88
(monthFunnel/FIXED_CATEGORIES removed with SpendFunnel.tsx). Custom
recharts node renderer for labels (their default node has no text);
horizontal scroll wrapper for narrow screens.

## 5. Blockers and Deferred

None blocking. Displaced old WORK-005 scope (later package): one-off
income events, income frequency, edit UIs for recurring/income,
recurring endedAt. WORK-006/007 roadmap unchanged otherwise. Known data
consideration for BA: stored records still carry legacy "Food" and
"Entertainment & Subscriptions" values after the split — handling is a
material rule (§ gate).

## 6. Completion

Delivered when slices are pushed and verified: onboarding collects
balance + expectations, expectations editable from the top bar, month
view shows expected vs actual for six buckets, taxonomy is 16 in
buckets, dashboard shows capture -> month -> projection -> month list
with a saved bar, sankey replaces the funnel, projection anchors at the
starting balance. QA waived -> human verifies manually.
