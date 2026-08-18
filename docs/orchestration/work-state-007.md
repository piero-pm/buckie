# Work State: Navigation & UX

| Field | Value |
| --- | --- |
| ID | WORK-007 |
| Status | Deployed — awaiting human manual verification |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Integration |
| Next owner | Human (manual verification) |
| Updated | 2026-08-19 |

## 1. Request and Route

Navigation & UX: (1) URL routing — deep links, browser back/forward,
refresh-stable views (router choice is a Lead call); (2) dashboard month
prev/next arrows; (3) a Settings page — display currency, lock timeout /
idle auto-lock; (4) gray.5 contrast sweep — replace small gray.5 text
with an AA-compliant token across all pages; (5) close TICKET-001..015
as shipped in docs (WORK-001 ledger debt).

Route: user-originated intake (PO satisfied by direct human request,
WORK-003..006 precedent) -> Business Analyst (BA-DS-012) -> Lead
Developer (slice direction) -> Developer. UX folded inline; QA waived
(human verifies manually) per WORK-001 standing waivers.

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction: navigation & UX | Human | Approved | Kickoff prompt 2026-08-18 (WORK-005 §5 roadmap) |
| BA-DS-012 material rules | Human | Approved | AskUser gate 2026-08-18: encrypted settings record; idle auto-lock default Never (opt-in); data-bounded month arrows |
| Slice direction + tickets | Human | Approved | AskUser gate 2026-08-18: 3 slices — S1 049/050, S2 051, S3 052; react-router-dom exception accepted (start S1) |
| UX stage | Human | Waived | Standing waiver WORK-001 (UX inline) |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |
| Slice pushes (production deploy) | Human | Approved | User "push" 2026-08-19; CI+Deploy green on 0f5f3a0 |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope §1 | BA elaborates |
| Business Analyst | Passed | BA-DS-005/009/010 + intake | BA-DS-012 approved; traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved BA-DS-012 | Slice direction + TICKET-049..052 approved | Developer starts S1 |
| Developer | Passed | Tickets 049-052 | S1 2bcb0c6, S2 f852ff0, S3 5df9758 — all gates green | Push approval |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices (Lead direction 2026-08-18): S1 = routing foundation (TICKET-049)
— react-router-dom (interface exception, recharts precedent; clean URLs
not hash) + a Go SPA fallback so unknown non-/api paths serve index.html
(+ test); App pages/views become routes; deep link -> login -> target;
locked refresh -> unlock -> target; back/forward. Month prev/next arrows
data-bounded (TICKET-050). S2 = settings (TICKET-051) — new encrypted
kind 'settings' (fixed-id, whitelist line + test; holds currency +
idleLockMinutes), SettingsPage on /settings, formatMoney(currency)
replacing formatEUR at call sites, useIdleLock hook (activity = click/
key/scroll/touch; clears key, routes to unlock; default Never). S3 =
polish (TICKET-052) — gray.5 -> gray.6 sweep (22 uses in 14 files) +
close TICKET-001..015 as Shipped in docs. Gate per slice = frontend
lint/prettier/vitest/tsc/build + backend go build/vet/gofmt/test (if
touched) + clean-artifacts sizes (mirror WORK-006 §4). Push needs human
approval (production deploy).

Manual production verification: deep link while signed out, refresh on
a view while locked, back/forward, month arrows + bounds, currency
switch formatting everywhere, idle lock at 5 min (opt-in), contrast
sweep, iPhone Safari.

### 4.1 Slice 1 gate evidence (2026-08-18, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; tests green incl. new TestSpaFallback
(real file serves, root index, client route falls back). Frontend:
eslint + prettier clean; 153/153 vitest incl. 3 new routing tests
(signed-out deep link -> login; locked refresh -> unlock; unlocked
refresh reloads the view); tsc + build green. react-router-dom 7.18.2
added (approved exception, direction gate). Sizes: all <=200 (App 195,
DashboardPage 188, MonthStepper 59, authRouting 29, routes 21).
Dev note: sign-out sets a signingOut ref before clearing userId — the
workspace login-redirect otherwise races the navigation in
non-batched renders.

### 4.2 Slice 2 gate evidence (2026-08-19, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; records tests green incl. new
settings-kind round-trip. Frontend: eslint + prettier clean; 161/161
vitest incl. 8 new (settings validation x3, formatMoney currencies
x2, idle lock: disabled/locks-after-window/activity-refresh x3); tsc
+ build green. Sizes: all <=200 (settings.ts 67, SettingsPage 104,
useIdleLock 49, useWorkspace 161, records.ts 159, HomePage 147).
formatEUR migrated to formatMoney(currency) across 16 call sites;
active currency is display-only module state set by useWorkspace on
load/save. Settings record: fixed-id encrypted kind (whitelist +
round-trip test), exported in backups via listAll.

### 4.3 Slice 3 gate evidence (2026-08-19, local ZCode/GLM-5.2)

Frontend + docs only: eslint + prettier clean; 161/161 vitest; tsc +
build green. gray.5 -> gray.6 sweep applied to every small-text use
(grep confirms zero c="gray.5" remain; 42 c="gray.6" uses across the
tree); the accepted filled-button label trade-off is untouched.
TICKET-001..015 statuses closed as Shipped (BR-TICK-DOC-1).

### 4.4 Integration result (2026-08-19)

Push approved ("push"). CI + Deploy green on 0f5f3a0. Operator-verified
on production: /health 200 "ok"; the SPA fallback answers /expenses
with 200 (deep link serves the app); deployed bundle index-DBA7VjJg.js
contains the WORK-007 markers (Display currency, Lock after
inactivity, previous month arrows, Settings nav, router). The single
remaining gray-5 in CSS is Mantine's internal placeholder variable,
outside the small-text sweep (source has zero c="gray.5"). Remaining:
human manual checks (§4 checklist).

## 5. Blocker and Restart

None. Router choice (react-router vs hash) is delegated to the Lead
(kickoff 2026-08-18); an interface/dependency exception, if any, routes
through the direction gate.

## 6. Completion

Pending.
