# Work State: Site Experience and Income

| Field | Value |
| --- | --- |
| ID | WORK-002 |
| Status | In progress |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Developer (Slice 4) |
| Next owner | Developer |
| Updated | 2026-08-16 |

## 1. Request and Route

Improve the live mybuckie.app experience: (1) re-theme to white + orange for a
technical open-source identity, (2) income tracking (salary, savings, stock
investments) with a two-stage onboarding (how it works + privacy/encryption,
then income setup) that is re-editable anytime, and (3) a persistent top
header: Log in when signed out; Expenses / Income / Help when signed in. No
burger menu (human preference).

Route: user-originated intake (PO satisfied by direct human request) ->
Business Analyst (BA-DS-005/006 + 6 tickets) -> Lead Developer (4-slice
direction, human-approved 2026-08-16) -> Developer. UX folded inline; QA
waived (human verifies manually) per WORK-001 standing waivers.

Scope note: investment portfolio tracking was excluded from Phase 1 intake
"without later human approval" (WORK-001 §1). The human requested income
sources incl. stock investments on 2026-08-15/16; approval recorded below.
API-based balance sync stays out of scope (source records only).

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| White + orange theme for open-source technical identity | Human | Approved | User message, 2026-08-15 |
| Income capture: salary, savings, stock investments | Human | Approved | User message, 2026-08-15/16 (lifts WORK-001 exclusion) |
| Top banner nav; no burger menu | Human | Approved | User message, 2026-08-15 |
| Onboarding stage 1 explains how it works + privacy/encryption, then income | Human | Approved | User message, 2026-08-16 |
| 4-slice direction + defaults (header contents, onboarding trigger, dashboard net) | Human | Approved | Plan approval, ZCode session 2026-08-16 |
| Slice 1 push (production deploy) | Human | Approved | AskUser answer, 2026-08-16 |
| Slice 2 push (production deploy) | Human | Approved | AskUser answer, 2026-08-16 |
| Investment API tracking deferred to future work | Human | Noted | "in the future we can track via api call" |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope + exclusions recorded above | BA elaborates |
| Business Analyst | Passed | Intake + Epic A specs | BA-DS-005/006, TICKET-017..022, traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Specs + live architecture | 4 slices: theme / header+help / income / onboarding+dashboard | Dev builds |
| Developer | In progress | Tickets 017-022 | Slices 1-3 integrated and live; Slice 4 gated, awaiting push approval | Human push approval |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Slice Map and Gate Evidence

Slices: S1=TICKET-017 theme; S2=018 header + 019 help; S3=020 income;
S4=021 onboarding + 022 dashboard. Gate = frontend lint/prettier/vitest/
build + backend go build/vet/gofmt/test + clean-artifacts sizes. Push needs
human approval (production deploy).

| Slice | Gate run (local, ZCode/GLM-5.2) | Integrated |
| --- | --- | --- |
| S1 theme | 37/37 vitest, all gates green; palette audit: no old hex in src/dist, #c2410c present; favicon in dist; ~5.2:1 AA | f06700b pushed, Deploy success — live |
| S2 header+help | 40/40 vitest (3 new: EX-NAV-1 x2, EX-NAV-2); files <=200; view state lifted to App | 06e575d pushed, Deploy success — live |
| S3 income | 48/48 vitest (5 validation + 3 aggregation); backend records ok incl. TestIncomeKindRoundTrip; IncomePage split 106+130 to stay <=200; ResizeObserver stub in test-setup | 5753dfe pushed, Deploy success — live |
| S4 onboarding+dash | 51/51 vitest (3 new: EX-ONB-1, EX-ONB-2 x2); frontend-only; DashboardSummary 54 + CategoryDonut 63 extracted to keep files <=200; dashboard income/net render covered by monthIncome unit tests (component-level waived, human verifies) | pending push |

Trunk repair (in S3): ym() appended T00:00:00 to every string, so full-ISO
createdAt values (which the UI really generates) parsed as Invalid Date —
production recurring templates created via the UI never expanded into
months. Fixed to accept date-only and full-ISO; regression test added.
Human should verify recurring items now appear on the production dashboard.

## 5. Blockers

None. Defaults adopted unless vetoed: header = brand + Expenses/Income/Help +
sign-out; Dashboard and Recurring stay on the hub; onboarding triggers while
the income register is empty, Skip leaves a dismissible hub card; dashboard
shows monthly income total + net (projection math unchanged, TICKET-015
decision preserved).
