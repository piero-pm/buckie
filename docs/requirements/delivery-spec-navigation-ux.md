# Delivery Specification: Navigation & UX

Status: approved at BA gate 2026-08-18 (encrypted settings record, idle default Never, data-bounded arrows)

| Field | Value |
| --- | --- |
| ID | BA-DS-012 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-18 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

Views become linkable (deep links, back/forward, refresh-stable), the
dashboard month moves with one tap, money shows in the user's currency,
an idle workspace locks itself, and small text meets AA contrast.
Benefit: the app feels like a proper web app and reads comfortably.

## 2. Behavior

Each workspace view gets a URL (router tech is a Lead call); signing in
after a deep link lands on the target view; refresh keeps the view when
still authed and unlocked, else routes to unlock. The dashboard month
selector gains prev/next arrows. A Settings page edits display currency
and idle auto-lock. All small gray.5 text switches to an AA-compliant
token. WORK-001 tickets 001..015 close as shipped in docs.

## 3. Rules and Examples

BR-ROUTE-1: workspace views (home, capture, expenses, recurring,
income, expected, help, settings) map to URLs; back/forward and refresh
behave; deep links to authed views while signed out go login -> target;
signed-in-but-locked goes to unlock -> target.
BR-MTH-1: the dashboard month selector gains prev/next arrows stepping
one month, data-bounded (gate 2026-08-18): no earlier than the first
data month, no later than the current month; arrows disable at bounds.
BR-CUR-1: display currency is a per-user setting stored as a fixed-id
encrypted record (gate 2026-08-18; expectations pattern) — formatting
only, stored amounts never convert.
BR-LOCK-IDLE-1: idle auto-lock clears the cached key and routes to
unlock after the configured inactivity window; default Never (gate
2026-08-18 — opt-in), options Never/5/15/30/60 min; activity = any
click, key, scroll, or touch.
BR-CONT-1: small gray.5 text is replaced by an AA-compliant token
(gray.6, ~6:1 on white) across pages; the accepted filled-button label
trade-off is untouched.
BR-TICK-DOC-1: TICKET-001..015 statuses close as Shipped in
docs/requirements/tickets (ledger accuracy only, no code).

| ID | Given | When | Then |
| --- | --- | --- | --- |
| EX-NU-1 | signed out | open /expenses directly | login shows, then the browser opens |
| EX-NU-2 | signed in, unlocked | refresh on /income | the income view reloads |
| EX-NU-3 | signed in, locked | refresh on /expenses | unlock shows, then expenses |
| EX-NU-4 | dashboard on August | tap prev arrow twice | June renders; next steps back |
| EX-NU-5 | currency set to USD | any amount renders | $ formatting, unchanged stored value |
| EX-NU-6 | idle lock 15 min | 15 min without activity | key clears; unlock re-asks passphrase |

## 4. Acceptance Boundary

Confirmed when routing, arrows, settings, lock, and contrast behave per
scenarios on production incl. iPhone Safari. Human verifies manually
(QA waived) + vitest/Go.

## 5. Dependencies and Constraints

Extends BA-DS-005 (header), BA-DS-009 (lock/export), BA-DS-010
(dashboard). Router and any new dependency route through the Lead gate;
currency setting may reuse the fixed-id encrypted-record pattern
(expectations precedent).

## 6. Exclusions and Open Decisions

Excludes: month-in-URL deep links, multi-currency conversion, per-view
URL params, remember-device changes. Resolved at the gate 2026-08-18:
encrypted settings record; idle default Never; data-bounded arrows.
Router tech stays a Lead call at the direction gate.

## 7. Traceability and Approval

Source: user intake 2026-08-18 (kickoff; WORK-005 §5 roadmap). Rules
BR-ROUTE-1, BR-MTH-1, BR-CUR-1, BR-LOCK-IDLE-1, BR-CONT-1,
BR-TICK-DOC-1; examples EX-NU-1..6. Approval: human gate passed
2026-08-18.
