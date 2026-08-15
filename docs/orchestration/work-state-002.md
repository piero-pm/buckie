# Work State: Site Experience and Income

| Field | Value |
| --- | --- |
| ID | WORK-002 |
| Status | In progress |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Developer (Slice 1) |
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
sources incl. stock investments on 2026-08-15/16; that approval is recorded
below. API-based balance sync stays out of scope (source records only).

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| White + orange theme for open-source technical identity | Human | Approved | User message, 2026-08-15 |
| Income capture: salary, savings, stock investments | Human | Approved | User message, 2026-08-15/16 (lifts WORK-001 exclusion) |
| Top banner nav; no burger menu | Human | Approved | User message, 2026-08-15 |
| Onboarding stage 1 explains how it works + privacy/encryption, then income | Human | Approved | User message, 2026-08-16 |
| 4-slice technical direction + defaults (header contents, onboarding trigger, dashboard net) | Human | Approved | Plan approval, ZCode session 2026-08-16 |
| Investment API tracking deferred to future work | Human | Noted | "in the future we can track via api call" |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope + exclusions recorded above | BA elaborates |
| Business Analyst | Passed | Intake + Epic A specs | BA-DS-005 (site chrome), BA-DS-006 (income), TICKET-017..022, traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Specs + live architecture | 4 slices: theme / header+help / income / onboarding+dashboard | Dev builds Slice 1 |
| Developer | In progress | Tickets 017-022 | Slice map in §4 | Gates + human push approval |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Slice Map and Gates

Slice 1 = TICKET-017 theme. Slice 2 = TICKET-018 header + 019 help.
Slice 3 = TICKET-020 income. Slice 4 = TICKET-021 onboarding + 022 dashboard.

Gate per slice (local, before push): frontend lint/prettier/vitest/build;
backend go build/vet/gofmt/go test; clean-artifacts size check; WCAG 2.2 AA
spot check (theme). Push to origin/main requires human approval (production
deploy). Gate evidence appended below as slices complete.

Slice 1 gate run (2026-08-16, local, ZCode/GLM-5.2): frontend lint clean,
prettier clean, vitest 37/37 pass, vite build ok (794 kB / 232 kB gzip —
chunk-size warning pre-existing). Backend untouched, gates re-run green
(build/vet/gofmt/test ok, cached). Palette audit: no indigo/old hex in src
or dist; #c2410c present (theme, donut, bar); favicon.svg built into dist.
Primary #c2410c on white ~5.2:1 (WCAG 2.2 AA). Visual: preview served at
localhost:4173 for human inspection; screenshots blocked (capture error),
human verifies manually per waiver.

Slice 1 integrated 2026-08-16: human approved push; origin/main f06700b;
Deploy workflow success — theme live on mybuckie.app.

Slice 2 gate run (2026-08-16, local): frontend lint clean, prettier clean,
vitest 40/40 pass (3 new header tests: EX-NAV-1 x2, EX-NAV-2 view switch +
sign-out), vite build ok. All touched files <=200 lines (App 149, HomePage
116, HubView 126, AppHeader 141, HelpPage 79, PrivacyExplainer 50); view
state lifted to App; hub row + duplicate nav button removed per TICKET-018.
zIndex style-prop warning fixed inline. Backend untouched.

## 5. Blockers

None. Defaults adopted unless vetoed: header = brand + Expenses/Income/Help +
sign-out; Dashboard and Recurring stay on the hub; onboarding triggers while
the income register is empty, Skip leaves a dismissible hub card; dashboard
shows monthly income total + net (projection math unchanged, TICKET-015
decision preserved).
