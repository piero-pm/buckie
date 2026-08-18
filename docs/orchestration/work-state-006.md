# Work State: Insights + Capture Completeness

| Field | Value |
| --- | --- |
| ID | WORK-006 |
| Status | Running — Developer (S1) |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Developer |
| Next owner | Developer (Slice 1) |
| Updated | 2026-08-18 |

## 1. Request and Route

Insights + capture completeness: (1) expense list gains month selector,
category filter, and text search; (2) two new charts from the installed
@mantine/charts — a spend-calendar heatmap and per-category 12-month trend
lines; (3) one-off income events (bonus/gift/refund) as a new encrypted
record kind; (4) income frequency weekly/quarterly/yearly, prorated in
aggregation; (5) edit UIs — recurring end becomes history-preserving
`endedAt` (replacing the retroactive `active:false` end, a known bug),
income sources become editable, and EditExpense gains an editable note.
Budgets were absorbed by WORK-005's expected-vs-actual.

Route: user-originated intake (PO satisfied by direct human request,
WORK-003/004/005 precedent) -> Business Analyst (BA-DS-011) -> Lead
Developer (slice direction) -> Developer. UX folded inline; QA waived
(human verifies manually) per WORK-001 standing waivers.

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction: insights + capture completeness | Human | Approved | Kickoff prompt 2026-08-18 (WORK-005 §5 roadmap) |
| BA-DS-011 material rules | Human | Approved | AskUser gate 2026-08-18: actual-occurrence proration; typed eventKind (bonus/gift/refund/other); legacy ended recurring stays invisible; old "Recent expenses" removed |
| Slice direction + tickets | Human | Approved | AskUser gate 2026-08-18: 3 slices — S1 042/043, S2 044/045/046, S3 047/048 (start S1) |
| UX stage | Human | Waived | Standing waiver WORK-001 (UX inline) |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |
| Slice pushes (production deploy) | Human | Pending | Push gate per package |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope §1 | BA elaborates |
| Business Analyst | Passed | BA-DS-006/008/010 + intake | BA-DS-011 approved; traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved BA-DS-011 | Slice direction + TICKET-042..048 approved | Developer starts S1 |
| Developer | Running | Tickets 042-048 | S1 in progress | Green gates per slice |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices (Lead direction 2026-08-18): S1 = income completeness — one-off
income events (new kind, server whitelist line + test) counted into
monthIncome, income frequency by actual occurrences, income edit UI
(TICKET-042/043). S2 = capture completeness — expense browser (month +
category + text) replacing the flat recent list, recurring
history-preserving endedAt end, editable expense note (TICKET-044/045/
046). S3 = insight charts — spend-calendar heatmap + per-category
12-month trend lines as new cards after the month list (BR-DASH-1 order
untouched; charts from installed @mantine/charts; DashboardPage stays
<=200 by extracting HeatmapCard/CategoryTrendCard components)
(TICKET-047/048). Gate per slice = frontend lint/prettier/vitest/tsc/
build + backend go build/vet/gofmt/test (if touched) + clean-artifacts
sizes (mirror WORK-005 §4). Push needs human approval (production
deploy).

Manual production verification: browser filters/search, heatmap +
trends with real history, bonus event in saved bar/sankey, weekly
source occurrence math, recurring end keeping history, income edit,
note edit, iPhone Safari.

### 4.1 Slice 1 gate evidence (2026-08-18, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; records tests 22 pass incl. new
income_event round-trip. Frontend: eslint + prettier clean; 135/135
vitest incl. 17 new (income-month occurrence math x13: monthDiff,
weekday counts, weekly 4/5-Tuesday months, quarterly/yearly strides,
ended-history, events; incomeEvent validation x5; frequency
validation x2); tsc + build green. Sizes: all <=200 (incomeEvent.ts 98,
income-month.ts 66, income.ts 169, IncomeEvents 178, IncomePage 157,
IncomeForm 196, records.ts 145, useWorkspace 139). Defect found+fixed:
backup export (raw.listAll) silently skipped the expectations kind
since WORK-005 — now exports all five kinds. monthIncome moved from
aggregation.ts to domain/income-month.ts (frequency-aware, events
param); KDF/vault tests gained 30s timeouts (36728ef rationale) —
they time out locally under whole-suite load without them.

### 4.2 Slice 2 gate evidence (2026-08-18, local ZCode/GLM-5.2)

Frontend only (backend untouched): eslint + prettier clean; 145/145
vitest incl. 10 new (expenseFilter compose x4 + months x2: recurring
included, current reachable; expandRecurring endedAt keeps history +
legacy stays invisible x2; browser filter UI + note edit round-trip
x2); tsc + build green. Sizes: all <=200 (ExpensesPage 159, BrowserRow
65, expenseFilter 61, EditExpense 105, RecurringPage 200). Old flat
"Recent expenses" removed — the browser replaces it; recurring rows
render read-only in the browser (synthetic ids), editing stays on the
recurring page (end/remove).

## 5. Blocker and Restart

None. Displaced-scope ledger: items 3–5 of the kickoff scope may shift to
a later package if the Lead judges the package too heavy (kickoff note
2026-08-18); that trim happens at the direction gate, recorded here.

## 6. Completion

Pending.
