# Work State: Visual identity — landing + dashboard unify

| Field | Value |
| --- | --- |
| ID | WORK-008 |
| Status | In progress |
| Active project | buckie |
| Request class | Increment to live product (frontend/visual only) |
| Current stage | Developer (S1) |
| Next owner | Developer |
| Updated | 2026-08-19 |

## 1. Request and Route

Unify myBuckie's visual identity (paper/ink/rust/vault per the concept
mockup `mybuckie-landing-concept.html`): rebuild the landing page
(vault-card encryption demo, ledger features, dashboard preview with
example-data caption, CTA hierarchy fix) and re-theme the in-app
dashboard to the same tokens (charts, lists, semantic colors).

Route (human-directed 2026-08-19): user-originated intake -> Lead
Developer -> Developer. **BA and Orchestrator waived by the human**
("no need for the BA and full orchestrator — this is already a good
artifact"); the user's two task prompts, condensed by Lead into
BA-DS-013, serve as the delivery spec. UX waived (inline, WORK-001);
QA waived (human verifies manually, WORK-001).

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction + BA/orchestrator waiver | Human | Approved | Session 2026-08-19: "just lead dev and dev… updating how it looks" |
| Delivery spec BA-DS-013 (digest of user prompts) | Human | Approved | Plan approval 2026-08-19 (ExitPlanMode) |
| Slice direction + tickets 053-055 | Human | Approved | Plan approval 2026-08-19 |
| Fonts self-hosted via @fontsource | Human | Approved | AskUser gate 2026-08-19 |
| Direct-recharts exceptions (bar labels, projection band) | Human | Approved | Plan approval 2026-08-19 (Sankey precedent) |
| Copy change "Access your space"→"Get started free", "Log in"→"Sign in" | Human | Approved | Plan approval 2026-08-19 |
| UX stage | Human | Waived | Standing waiver WORK-001 |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |
| Push (production deploy) | Human | Pending | Local verification first, per human instruction |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake | Scope §1 | Lead direction |
| Business Analyst | Excluded | User prompts (2026-08-19) | Waived; prompts condensed as BA-DS-013 | n/a |
| Lead Developer | Passed | BA-DS-013 | Slice direction + TICKET-053..055 approved | Developer starts S1 |
| Developer | In progress | Tickets 053-055 | S1/S2/S3 | Gates per slice, then push approval |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices (Lead direction 2026-08-19): S1 = tokens + fonts + landing
rebuild (TICKET-053). S2 = one chart palette (stable category/bucket
colors) across donut/sankey/month bars/trend/heatmap/category trends
(TICKET-054). S3 = lists + semantic colors + divider sweep + WCAG
ratios recorded (TICKET-055). Gate per slice = frontend
eslint/prettier/vitest/tsc/build + clean-artifacts sizes (backend
untouched). Local verification on :8090 with seed + screenshots before
any push; push needs human approval (production deploy).

Manual production verification (draft): landing (EX-VI-1..5), dashboard
re-theme (EX-VI-6), other pages inherit paper theme, iPhone Safari,
keyboard focus, reduced motion.

### 4.1..4.4 Slice gate evidence + integration result (2026-08-19)

All three slices landed on the trunk, each gate-green before its commit
(tsc + eslint + prettier + vitest + build; backend untouched):

- S1 `82711fc` (TICKET-053): tokens + @fontsource fonts + rust/warm-gray/
  paper Mantine tuples + landing rebuild (Hero/VaultCard/FeatureLedger/
  DashboardPreview/LandingFooter) + AppHeader (Fraunces brand, "Sign in"
  text link) + rust favicon. 166/166 vitest (5 new landing tests).
- S2 `7e9c67f` (TICKET-054): stable category/bucket palette across donut
  (% of total, 1:1 swatches), sankey (target-colored flows at 0.65,
  Saved green, values on nodes), MonthBars + TrendView on direct
  recharts (approved exceptions) with data labels, niceTicks, projection
  band, and the duplicate "Aug 26" boundary tick fixed (buildTrendRows,
  unit-tested). Two hardcoded € formatters fixed. 171/171 vitest.
- S3 `11c6c10` (TICKET-055): ledger-style expense rows (category icons,
  amber mono RECURRING pill, mono amounts), moss/amber tuples, semantic
  colors (SavedBar/ExpectedVsActual/DashboardSummary), Fraunces hero
  total, #e9ecef sweep complete (zero remain), contrast table in
  TICKET-055 — all pairs AA; filled-button label now 4.97:1 (old ≈3.5:1
  trade-off resolved). 171/171 vitest.

Local verification (:8090, seeded test123 account, screenshots desktop
+ mobile 390px): landing all five sections render (EX-VI-1..5); dashboard
(EX-VI-6) — serif hero total, moss net/saved, donut %, sankey colors +
values, bar labels + even ticks, solid/dashed balance with band, icons +
amber pills, heatmap rust ramp, bucket-colored trends; expenses/income/
settings/help inherit the paper theme; mobile no overflow (sankey
scrolls horizontally by design). Category-trend 12-month range renders
fully; only ~4 months carry seed data (sparsity, not truncation).
Integration: awaiting human push approval (deploy = production).

## 5. Blocker and Restart

None. Rollback = revert slice commits (restores white/orange face).
The filled-button label trade-off is resolved (4.97:1, TICKET-055).

## 6. Completion

Built and locally verified 2026-08-19; pending: human manual checks
(§4 draft list) and push approval → deploy → live verification.
