# TICKET-049: URL routing

Status: approved with WORK-007 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | URL routing (REQ-34, BR-ROUTE-1) |
| Spec | [../delivery-spec-navigation-ux.md](../delivery-spec-navigation-ux.md) |
| Outcome | WORK-007 — navigation & UX |
| Sequence | WORK-007 Slice 1 — first |
| Depends on | none |

## Intent

As a user I want each view to have a URL, so I can deep-link, refresh,
and use browser back/forward like any web app.

## Behavior

Workspace views map to routes (/, /capture, /expenses, /recurring,
/income, /expected, /help, /settings) plus login/setup/unlock pages.
Deep links to authed views while signed out go login -> target;
signed-in-but-locked refresh goes unlock -> target; back/forward walk
the history. Router: react-router-dom (Lead call, interface exception —
recharts precedent); the Go server gains an SPA fallback so unknown
non-/api paths serve index.html.

## Acceptance

- Opening /expenses signed out shows login, then the browser (EX-NU-1).
- Refresh on /income while unlocked reloads the view (EX-NU-2); while
  locked, unlock shows first (EX-NU-3).
- Browser back/forward move between visited views.

## Out of scope / notes

Month-in-URL stays out. AppHeader nav becomes router links; App page
state collapses into routes; existing App.test flows keep passing
(memory router in tests).
