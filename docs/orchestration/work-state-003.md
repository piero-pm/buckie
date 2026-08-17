# Work State: Login Scale, Honest Errors, Home and Prediction

| Field | Value |
| --- | --- |
| ID | WORK-003 |
| Status | Completed 2026-08-17 — S3 deployed (via WORK-004 batch) and verified in production |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Developer complete (S1/S2 live) — final push + manual verification |
| Next owner | Human |
| Updated | 2026-08-16 |

## 1. Request and Route

(1) Support ~50 users with at least 15 logins in the same hour on the
current droplet; (2) honest unhappy paths: no silent failures on login or
data-save errors — actionable messages everywhere; (3) home redesign for
returning users: add-expense entry at top, scroll to two dashboards —
current month with expected expenditure based on the previous month, and a
selectable 3/12-month view of average spending/saving with a future-balance
prediction; (4) lighter capture ("I am not a bank" — general everyday
spending, not bank-grade detail).

Route: user-originated intake (PO satisfied by direct human request) ->
Business Analyst (BA-DS-007/008) -> Lead Developer (slice direction) ->
Developer. UX folded inline; QA waived (human verifies manually) per
WORK-001 standing waivers.

Scale note: the current droplet is sufficient for 50 users / 15
logins/hour (server compute trivial; Argon2id runs client-side). The
binding constraint is a latent defect: behind Caddy every request appears
as 127.0.0.1, so the 5/hour per-IP cap is one shared bucket for all users
(found 2026-08-16; auth/handler.go + auth/rate.go).

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction (scale + errors + home/prediction) | Human | Approved | User message, 2026-08-16 |
| BA-DS-007 login scale and honest errors | Human | Approved | Gate answers, 2026-08-16 |
| BA-DS-008 home flow, capture, prediction | Human | Approved | Gate answers, 2026-08-16 |
| Rate ceilings 100/IP + 10/email (email lowered from 20: anti-bombing + Resend quota) | Human | Approved | Gate answer, 2026-08-16 |
| Taxonomy 8 -> 14 categories; income kinds + freelance/other, savings kept | Human | Approved | Gate answer, 2026-08-16 |
| Charts: funnel + trend both | Human | Approved | Gate answer, 2026-08-16 |
| Benchmark basis: 3-month average | Human | Approved | Gate answer, 2026-08-16 |
| TICKET-015 resolved income-aware (BA-DS-008 BR-PRJ-2) | Human | Approved | Gate answer, 2026-08-16 |
| Resend cooldown 60 s | Human | Default adopted | BA-DS-007 §6, vetoable at Lead gate |
| 3-slice direction + tickets 023..029 | Human | Approved | AskUser answer, 2026-08-16 |
| Slice 1 push (production deploy) | Human | Approved | AskUser answer, 2026-08-16 (ba58947 pushed) |
| Slice 2 push (production deploy) | Human | Approved | AskUser answer, 2026-08-16 (ef6d8dd pushed) |
| Slice 3 push (production deploy) | Human | Approved | AskUser answer, 2026-08-17 — pushed with the WORK-004 batch; deploy green at 36728ef |
| UX stage | Human | Waived | Standing waiver WORK-001 (UX inline) |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope §1 | BA elaborates |
| Business Analyst | Passed | Intake + BA-DS-001/003/004/006 | BA-DS-007/008, TICKET-023..029, traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved specs | 3-slice direction §4 | Human approves direction |
| Developer | Passed | Tickets 023-029 | S1+S2 live (ba58947, ef6d8dd); S3 gates green, push pending | S3 push + human verification |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices: S1 = TICKET-023 client-IP limits + 024 honest email failures +
025 mutation audit (BA-DS-007). S2 = 026 taxonomy + chips + 027 home
scroll (BA-DS-008). S3 = 028 month benchmark + funnel + 029 3/12-month
trend + prediction.

Gate = frontend lint/prettier/vitest/build + backend go
build/vet/gofmt/test + clean-artifacts sizes (mirror WORK-002 §4). Push
needs human approval (production deploy). Manual production verification:
15+ logins in one hour, throttle copy, forced save failure (offline),
iPhone Safari scroll.

### 4.1 Slice 1 gate evidence (2026-08-16, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; 30/30 tests incl. 4 new
(forwarded-IP keying, per-IP + per-email ceilings, truthful 429 body,
send-failure 502). Frontend: eslint + prettier clean; 58/58 vitest incl.
7 new (throttle copy, resend + cooldown, change-email, 4 mutation-failure
visibles); build green. Sizes: source files <=200 (ExpensesPage 116 +
EditExpense 89 extracted); specs 98/107 lines (WORK-002 precedent 109;
further trimming would drop approved rule content).

### 4.2 Slice 2 gate evidence (2026-08-16, local ZCode/GLM-5.2)

S1 deployed: ba58947 pushed, CI + Deploy success — live. Frontend S2:
eslint + prettier clean; 64/64 vitest incl. 6 new (3 topCategories, 2
home-scroll order, 1 chips; taxonomy/expense tests updated for 14
categories); build green. Sizes: all touched files <=200 (HubView 138,
DashboardPage 137, CapturePage 179, aggregation 160). S2 deployed:
ef6d8dd pushed, CI + Deploy success — live.

### 4.3 Slice 3 gate evidence (2026-08-16, local ZCode/GLM-5.2)

Frontend only: eslint + prettier clean; 77/77 vitest incl. 13 new
(8 prediction domain: figures/averages/cumulative/benchmark/funnel;
3 TrendView incl. EX-PRJ-2 window switch + EX-PRJ-3 guidance); build
green. New modules stay <=200: prediction.ts 113, TrendView 127,
DashboardPage 132, SpendFunnel 37, MonthBenchmark 32. Old text-only
projection card removed (superseded by TrendView).

## 5. Blockers and Deferred

None blocking. Deferred fast-follows (human-noted, out of WORK-003
scope): offsite backups/Litestream, PUT request-size limit, /health
endpoint. Human verification checklist (production): 15+ logins in one
hour, throttle copy on a 429, forced save failure (devtools offline),
iPhone Safari home scroll, funnel + trend render with real history.

## 6. Completion

Delivered when S3 is pushed and verified: honest login scale (100/IP,
10/email real-client-IP limits, truthful errors, resend), mutation
failures visible, 14-category everyday capture with quick-pick chips,
one-scroll home (capture -> recents -> month view), 3-month expected-
spend benchmark, month funnel, income-aware 3/12-month trend with
projected balance (TICKET-015 resolved). QA waived -> human verifies
manually; integration via ba58947, ef6d8dd, and the S3 commit.
