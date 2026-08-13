# Product Strategy: Buckie

| Field | Value |
| --- | --- |
| Status | Recommendation; human approval pending |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |

## 1. Product Thesis

Enduring problem: a salaried person spends across many small categories each month but keeps no low-friction record, so money movement stays invisible and savings never accumulate. Source: First Principles thesis, this document.

- Affected people: individual salaried earners who self-describe as poor money managers. Evidence: one user (the owner); not market-validated.
- Fundamental function: capture spending, make it visible, turn visibility into decisions that raise monthly savings; this function predates software.
- Prior equivalents (investigated, not invented): paper cash book, envelope budgeting, bank passbook, spreadsheets. Lesson: capture friction kills the habit and visibility alone does not guarantee behavior change.
- Decisive constraints: near-zero mobile-browser capture friction; strong per-user privacy (a multi-user host must not read others' financial data); low cost, open-source, self-hostable; single-user first.
- Causal hypotheses (provisional owner judgment): H1 no visibility leads to uninformed spending and no savings; H2 capture friction is why records lapse; H3 periodic guidance nudges a saving action.
- Falsifiers: owner captures a full month yet finds no cut worth making (H1 weak); capture stays sporadic despite easy entry (H2 weak).
- Solution-independent success: the person can see spend by category this month versus last at any time, and takes one deliberate saving action.

## 2. Target Progress

| Actor | Situation | Progress sought | Current alternative |
| --- | --- | --- | --- |
| Salaried spender/saver (owner) | Just spent, or reviewing the month | Record fast, see where money goes, grow savings | Memory, bank app, nothing |
| Self-hoster/operator (owner) | Deploying for self, maybe friends later | Run cheaply and prove privacy to users | Trust a third-party app |

## 3. Strategic Direction

Value proposition: a private, self-hostable spending mirror that makes monthly money movement visible with minimal capture effort and a credible privacy promise.

- Fact: only one committed user today (the owner).
- Owner judgment: privacy and low friction are the decisive adoption levers.
- Hypothesis: visibility plus light guidance produces a saving action.
- Unknown: whether anyone beyond the owner will adopt it.

Why now: the owner has no current dashboard and wants to start a long-term savings horizon; building small and open keeps cost and lock-in low.

## 4. Outcomes and Evidence

| Outcome | Evidence | Confidence | Falsifier |
| --- | --- | --- | --- |
| Trusted private access + storage | Owner privacy demand | Medium | Owner accepts host-readable data |
| Low-friction expense capture | Owner intent | Medium | Capture lapses despite ease |
| Recurring fixed expenses | Owner intent | Medium | Fixed costs rarely change the picture |
| Spending-visibility dashboard | Owner intent | Medium | Owner ignores the dashboard |
| User-invoked periodic guidance | Owner intent | Low | Guidance yields no saving action |

Candidate North Star (needs human approval): share of review cycles in which the user opens the dashboard and records one deliberate saving action. Counter-metrics: capture completeness/data quality, and zero cross-user privacy incidents. Gaming risk: logging actions without real behavior change; review quarterly.

## 5. Scope and Exclusions

In scope: the private capture-to-visibility loop plus user-invoked guidance for one, then several, self-hosted users. Excluded from Phase 1 (future value only): bank/spreadsheet import with AI auto-categorization; investment-portfolio tracking with email summaries. Reason: each adds scope and risk beyond the core habit.

## 6. Constraints and Risk Inputs

- Human-stated technical constraint (not a product decision): preferred stack is Go backend + React frontend; recorded for the Lead Developer, not designed around here.
- BA business-risk, Lead Developer feasibility/technical-risk, and QA quality-risk briefs are not yet produced and are required before scope approval.

## 7. Decisions and Approval

- Rejected alternative: including import and portfolio tracking now; deferred to keep Phase 1 minimal.
- Open questions: North Star wording; multi-user timing; guidance as microservice vs export file; per-user encryption expectations (for Lead Developer).
- Human verdict: pending. This entire artifact is a recommendation awaiting explicit human approval.
