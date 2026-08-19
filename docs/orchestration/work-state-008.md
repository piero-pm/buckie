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

### 4.1..4.4 Slice gate evidence + integration result

(pending per slice; recorded as each lands)

## 5. Blocker and Restart

None. Rollback = revert slice commits (restores white/orange face).
Known accepted trade-off to re-verify: filled-button label contrast
(previously accepted ≈3.5:1 on orange; paper-on-rust re-measured in
S3 and reported).

## 6. Completion

(pending)
