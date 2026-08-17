# Traceability Record: Epic A — Private Spending-Visibility Loop

Status: recommendation; human approval pending

| Field | Value |
| --- | --- |
| ID | BA-TR-001 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |

## 1. Source Chain

| Item ID | Type | Authoritative link | Status | Supersedes |
| --- | --- | --- | --- | --- |
| STRAT | Strategy | [../product/strategy.md](../product/strategy.md) | Recommendation | None |
| ROAD | Outcome roadmap | [../product/outcome-roadmap.md](../product/outcome-roadmap.md) | Recommendation | None |
| EPIC-A | Epic scope | [../product/epic-scope.md](../product/epic-scope.md) | Recommendation | None |
| BA-AN-001 | Analysis brief | [analysis-brief.md](analysis-brief.md) | Recommendation | None |
| BA-DS-001 | Delivery spec (login) | [delivery-spec-login.md](delivery-spec-login.md) | Recommendation | None |
| BA-DS-002 | Delivery spec (capture) | [delivery-spec-capture.md](delivery-spec-capture.md) | Recommendation | None |
| BA-DS-003 | Delivery spec (recurring) | [delivery-spec-recurring.md](delivery-spec-recurring.md) | Recommendation | None |
| BA-DS-004 | Delivery spec (dashboard) | [delivery-spec-dashboard.md](delivery-spec-dashboard.md) | Recommendation | None |
| BA-DS-005 | Delivery spec (site chrome) | [delivery-spec-site-chrome.md](delivery-spec-site-chrome.md) | Approved (WORK-002) | None |
| BA-DS-006 | Delivery spec (income) | [delivery-spec-income.md](delivery-spec-income.md) | Approved (WORK-002) | None |
| BA-DS-007 | Delivery spec (login scale) | [delivery-spec-login-scale.md](delivery-spec-login-scale.md) | Approved (WORK-003) | None |
| BA-DS-008 | Delivery spec (home + prediction) | [delivery-spec-home-prediction.md](delivery-spec-home-prediction.md) | Approved (WORK-003) | None |
| BA-DS-009 | Delivery spec (data safety) | [delivery-spec-data-safety.md](delivery-spec-data-safety.md) | Approved (WORK-004) | None |
| BA-DS-010 | Delivery spec (expected vs actual) | [delivery-spec-expected-actual.md](delivery-spec-expected-actual.md) | Approved (WORK-005) | None |

## 2. Coverage

| Outcome | Requirement | Spec / Rule | Acceptance example | Ticket |
| --- | --- | --- | --- | --- |
| 1 Access + storage | REQ-1 Passwordless email-code login | BA-DS-001 | EX-LOGIN-1..4 | TICKET-001, 002 |
| 1 Access + storage | REQ-2 Session lifetime + sign out | BA-DS-001 | EX-LOGIN-1,4 | TICKET-003 |
| 1 Access + storage | REQ-3 Per-user confidentiality | BA-DS-001 / BR-CONF-1 | EX-LOGIN-5 | TICKET-004 |
| 1 Access + storage | REQ-16 Encryption-passphrase setup | BA-DS-001 / BR-PASS-1,2 | EX-PASS-1..5 | TICKET-016 |
| 2 Capture | REQ-4 Record expense (amount+category+date) | BA-DS-002 | EX-CAP-1,2 | TICKET-005 |
| 2 Capture | REQ-5 Category taxonomy | BA-DS-002 / BR-CAT-1 | EX-CAP-1 | TICKET-006 |
| 2 Capture | REQ-6 Data-quality validation | BA-DS-002 / BR-DQ-1..4 | EX-CAP-3,4,6 | TICKET-007 |
| 2 Capture | REQ-7 Duplicate handling | BA-DS-002 / BR-DQ-5 | EX-CAP-5 | TICKET-008 |
| 2 Capture | REQ-8 Correct recent expenses | BA-DS-002 | EX-CAP-1 | TICKET-009 |
| 3 Recurring | REQ-9 Register recurring expense | BA-DS-003 / BR-REC-1 | EX-REC-1,3 | TICKET-010 |
| 3 Recurring | REQ-10 Recurring populates each month | BA-DS-003 / BR-REC-1 | EX-REC-1,2 | TICKET-011 |
| 3 Recurring | REQ-11 Edit/end recurring | BA-DS-003 | EX-REC-4,5 | TICKET-012 |
| 4 Dashboard | REQ-12 Month-on-month totals | BA-DS-004 | EX-DASH-1,3 | TICKET-013 |
| 4 Dashboard | REQ-13 Spend-by-category breakdown | BA-DS-004 | EX-DASH-2 | TICKET-014 |
| 4 Dashboard | REQ-14 Savings projection | BA-DS-004 | EX-DASH-4,5 | TICKET-015 |
| 1–4 (cross-cutting) | REQ-15 Responsive web (iPhone + desktop) | BA-DS-002/004 | EX-CAP-1, EX-DASH-1 | TICKET-005, 013 |
| WORK-002 Site chrome | REQ-17 White + orange accessible theme | BA-DS-005 / BR-THM-1 | EX-THM-1 | TICKET-017 |
| WORK-002 Site chrome | REQ-18 Persistent header navigation (no burger) | BA-DS-005 / BR-NAV-1 | EX-NAV-1..2 | TICKET-018 |
| WORK-002 Site chrome | REQ-19 Help + privacy reference | BA-DS-005 / BR-HLP-1 | EX-HLP-1 | TICKET-019 |
| WORK-002 Income | REQ-20 Income source register (salary/savings/investment) | BA-DS-006 / BR-INC-1..3 | EX-INC-1..4 | TICKET-020 |
| WORK-002 Income | REQ-21 Two-stage onboarding | BA-DS-006 / BR-ONB-1,2 | EX-ONB-1..2 | TICKET-021 |
| WORK-002 Income | REQ-22 Dashboard income + net | BA-DS-006 | EX-DASH-6 | TICKET-022 |
| WORK-003 Scale | REQ-23 Login scale + honest errors (100/IP, 10/email; truthful messages) | BA-DS-007 / BR-RL-1..3, BR-ERR-1..4 | EX-RL-1..3, EX-ERR-1..3 | TICKET-023, 024, 025 |
| WORK-003 Home | REQ-24 Home flow, 14-category capture, prediction dashboards | BA-DS-008 / BR-HOME-1..2, BR-CAP-1, BR-TAX-1, BR-INC-4, BR-PRJ-1..3 | EX-HOME-1, EX-CAP-1, EX-PRJ-1..3 | TICKET-026, 027, 028, 029 |
| WORK-004 Data safety | REQ-25 Lock on sign-out + encrypted export/import | BA-DS-009 / BR-LOCK-1, BR-EXP-1..2, BR-IMP-1..4 | EX-LOCK-1, EX-EXP-1, EX-IMP-1..3 | TICKET-030..033 |
| WORK-004 Data safety | REQ-26 Passphrase change without data loss | BA-DS-009 / BR-PASS-1..3 | EX-PASS-1..2 | TICKET-034, 035 |
| WORK-004 Data safety | REQ-27 Server hardening + copy quick wins | BA-DS-009 / BR-HARD-1..3, BR-QW-1..2 | EX-HARD-1 | TICKET-030, 031 |
| WORK-005 Expected | REQ-28 Buckets taxonomy 16 + expectations record + Expected view | BA-DS-010 / BR-TAX-2..3, BR-EXP-SET-1..2 | EX-EA-1, 2, 4 | TICKET-036, 037 |
| WORK-005 Expected | REQ-29 Expected-vs-actual + saved bar + dashboard order + month list | BA-DS-010 / BR-CMP-1, BR-DASH-1..2 | EX-EA-1, 3 | TICKET-038, 039 |
| WORK-005 Expected | REQ-30 Sankey + anchored projection | BA-DS-010 / BR-SANK-1, BR-PRJ-2 | EX-EA-5, 6 | TICKET-040, 041 |

Every requirement traces upward to an approved-outcome recommendation and
downward to acceptance examples and a ticket. No orphan requirements.

## 3. Decisions and Changes

| Date | Item | Change/rationale | Decision owner | Approval |
| --- | --- | --- | --- | --- |
| 2026-08-10 | BA-AN-001..BA-DS-004 | Initial elaboration of Epic A | Human | Pending |
| 2026-08-10 | BR-CAT-1 | Proposed category taxonomy | Human | Pending |
| 2026-08-10 | REQ-16 / BR-PASS-1,2 / TICKET-016 | Added encryption-passphrase setup (Slice 2, before capture) per ADR-002/003 | Human | Pending |
| 2026-08-16 | WORK-002 / BA-DS-005/006 / TICKET-017..022 | Site experience + income increment; user-originated intake, approved with 4-slice plan | Human | Approved |
| 2026-08-16 | Income incl. investments | Lifts WORK-001 Phase 1 exclusion of investment tracking; API balance sync stays out | Human | Approved |
| 2026-08-16 | Theme white + orange; no-burger header; two-stage onboarding | Identity, navigation, and first-run education decisions | Human | Approved |
| 2026-08-16 | WORK-003 / BA-DS-007/008 / TICKET-023..029 | Login scale + honest errors + home/prediction increment; user-originated intake, 3-slice plan | Human | Approved |
| 2026-08-16 | REQ-23 ceilings 100/IP + 10/email | Human proposed 100/20; per-email lowered to 10 on anti-bombing + Resend-quota rationale | Human | Approved |
| 2026-08-16 | BR-TAX-1 taxonomy 8 -> 14; BR-INC-4 income kinds + freelance/other (savings kept) | Extends REQ-5 and BR-INC-1; superset, no migration | Human | Approved |
| 2026-08-16 | TICKET-015 resolved: projection income-aware | Avg saving = avg income − avg spend over selected 3/12-month window (BA-DS-008 BR-PRJ-2) | Human | Approved |
| 2026-08-16 | WORK-004 / BA-DS-009 / TICKET-030..035 | Data-safety increment (lock, backup, passphrase change); user-originated intake, 3-slice plan | Human | Approved (gate) |
| 2026-08-17 | WORK-005 direction: expected vs actual + dashboard v2; buckets taxonomy 16 (groceries/restaurants split); rent/bills/subs expectations manual; sankey (recharts exception) | User intake reshaping the roadmap; merchant/payment/tags dropped as "generic tracker" | Human | Approved |
| 2026-08-17 | WORK-005 / BA-DS-010 | Remaining material rules (16-category table, legacy values, onboarding shape) | Human | Approved (gate: soft legacy, separate third stage) |

## 4. Link Integrity

All links target canonical product recommendations or sibling requirement files
in this folder; purpose is source justification; authority is the human; status
of every upstream source is "recommendation, approval pending". No broken,
external-only, or superseded links at time of writing.

## 5. Unresolved and Superseded

Open decisions (owner: human): recurring edit-effective timing. Resolved
2026-08-16: savings-projection method — income-aware averages over a
selectable 3/12-month window (BA-DS-008 BR-PRJ-2, TICKET-029); investment
income in scope as encrypted source records (API sync still excluded);
theme, header, and onboarding decisions recorded in work-state-002 §2.
Nothing superseded.

## 6. Handoff Verdict

PO scope alignment: pending. Dev shared-understanding: pending (QA waived; human
verifies manually). Material rule approvals: pending. Blockers: the open
decisions above may reshape acceptance. Human verdict: pending. This record and
all linked artifacts are recommendations awaiting explicit human approval.
