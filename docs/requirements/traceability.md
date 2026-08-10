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

## 2. Coverage

| Outcome | Requirement | Spec / Rule | Acceptance example | Ticket |
| --- | --- | --- | --- | --- |
| 1 Access + storage | REQ-1 Passwordless email-code login | BA-DS-001 | EX-LOGIN-1..4 | TICKET-001, 002 |
| 1 Access + storage | REQ-2 Session lifetime + sign out | BA-DS-001 | EX-LOGIN-1,4 | TICKET-003 |
| 1 Access + storage | REQ-3 Per-user confidentiality | BA-DS-001 / BR-CONF-1 | EX-LOGIN-5 | TICKET-004 |
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

Every requirement traces upward to an approved-outcome recommendation and
downward to acceptance examples and a ticket. No orphan requirements.

## 3. Decisions and Changes

| Date | Item | Change/rationale | Decision owner | Approval |
| --- | --- | --- | --- | --- |
| 2026-08-10 | BA-AN-001..BA-DS-004 | Initial elaboration of Epic A | Human | Pending |
| 2026-08-10 | BR-CAT-1 | Proposed category taxonomy | Human | Pending |

## 4. Link Integrity

All links target canonical product recommendations or sibling requirement files
in this folder; purpose is source justification; authority is the human; status
of every upstream source is "recommendation, approval pending". No broken,
external-only, or superseded links at time of writing.

## 5. Unresolved and Superseded

Open decisions (owner: human): category taxonomy final list; Phase 1 currency;
code validity window, attempt limit, and session lifetime; sane maximum amount
and oldest allowed date; duplicate-detection window; recurring edit-effective
timing; savings-projection method and inputs. Nothing superseded yet.

## 6. Handoff Verdict

PO scope alignment: pending. Dev shared-understanding: pending (QA waived; human
verifies manually). Material rule approvals: pending. Blockers: the open
decisions above may reshape acceptance. Human verdict: pending. This record and
all linked artifacts are recommendations awaiting explicit human approval.
