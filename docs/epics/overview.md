# Penny Saver — Epics & Delivery Overview

| Field | Value |
| --- | --- |
| Status | Living index (references canonical artifacts) |
| Owner | Human |
| Updated | 2026-08-10 |

This is a navigation index and phase plan. It does not replace the canonical product
artifacts; it points to them and records what we are doing now.

## What we are building

Penny Saver: a small, low-cost, open-source, self-hostable, responsive web app that
lets a salaried person record spending with almost no friction and see where their
money goes each month, so they can spot overspending and grow savings. Login is
passwordless email code. Stack constraint (human-stated): Go backend + React frontend.
Per-user encryption so a multi-user host cannot read another user's financial data.

## Phase 1 epics

- Epic A — Private Spending-Visibility Loop (ACTIVE): passwordless email-code login,
  per-user encrypted storage, daily/weekly expense capture with category dropdown,
  recurring monthly expenses, dashboard (month-on-month, category charts, savings
  projection), responsive web. Canonical scope: docs/product/epic-scope.md.
- Epic B — User-Invoked Periodic Guidance (NEXT, separate epic): a button that runs a
  periodic analysis suggesting where to cut back. Delivered as a microservice or an
  export file fed to an external AI pipeline. Not started; begins after Epic A.

## Phase 2 (future value only — excluded now)

- Bank/Excel statement import with AI auto-categorization.
- Investment-portfolio tracking with monthly email summaries.

These must not enter delivery scope without later explicit human approval.

## Canonical artifacts

- Product strategy: docs/product/strategy.md
- Outcome roadmap: docs/product/outcome-roadmap.md
- Epic scope contract: docs/product/epic-scope.md
- Orchestration work-state: docs/orchestration/work-state.md
- Requirements (PRD/tickets): docs/requirements/ (produced by Business Analyst)

## Current pipeline status

| Stage | Model | Status |
| --- | --- | --- |
| Product Owner | Opus 4.8 | Approved |
| Business Analyst (PRD + tickets) | Opus 4.8 | In progress |
| Lead Developer (delivery brief + hosting) | Opus 4.8 | Pending |
| Developer (implementation) | Sonnet 4.6 | Pending |
| Lead review | Opus 4.8 | Pending |
| UX | — | Folded in inline (waived) |
| QA | — | Human verifies manually (waived) |
