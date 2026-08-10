# Outcome Roadmap: Penny Saver

| Field | Value |
| --- | --- |
| Status | Recommendation; human approval pending |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |

## 1. Goal

Reference: Penny Saver strategy v0.1 (recommendation). Guarded North Star (candidate, needs human approval): share of review cycles in which the user opens the dashboard and records one deliberate saving action, with capture completeness and zero cross-user privacy incidents as counter-metrics.

## 2. Ordered Outcomes

| Order | Outcome | Actor progress | Evidence | Dependency | Why now |
| ---: | --- | --- | --- | --- | --- |
| 1 | Trusted private access + storage | User can log in passwordlessly and trust data is private | Owner privacy demand (1 user) | None | Privacy is a core promise; everything else depends on it |
| 2 | Low-friction expense capture | User records a spend and its category in seconds | Owner intent (1 user) | 1 | Core habit; no data means no value |
| 3 | Recurring fixed expenses | User registers known monthly costs once | Owner intent (1 user) | 2 | Completes the monthly picture for accuracy |
| 4 | Spending-visibility dashboard | User sees month-on-month and category spend plus projection | Owner intent (1 user) | 2, 3 | Turns data into the decisive visibility outcome |
| 5 | User-invoked periodic guidance | User requests advice and finds one saving action | Owner intent (1 user) | 4 | Highest uncertainty; depends on accumulated data |

Order is qualitative: dependency and risk-reduction dominate. Privacy (1) is prerequisite and the biggest trust risk; capture (2) feeds all value; recurring (3) makes the dashboard (4) accurate; guidance (5) is last because it needs data and carries the weakest evidence. No numeric WSJF: value inputs are one user and Lead Developer sizing is absent.

## 3. Impact Trace

```text
Goal -> Salaried spender/saver -> Logs in and trusts privacy -> Passwordless email-code login + per-user encrypted storage
Goal -> Salaried spender/saver -> Records each spend quickly -> Daily/weekly capture page with category dropdown
Goal -> Salaried spender/saver -> Registers fixed costs once -> Recurring monthly expenses section
Goal -> Salaried spender/saver -> Reviews spending monthly -> Dashboard: month-on-month, category charts, savings projection
Goal -> Salaried spender/saver -> Seeks and acts on advice -> User-invoked guidance (microservice or export)
Goal -> Self-hoster/operator -> Deploys cheaply and proves privacy -> Open-source, self-hostable build with per-user encryption
```

## 4. Validation

| Outcome | Assumption tested | Smallest evidence | Review condition |
| --- | --- | --- | --- |
| 1 Access + storage | Users need and trust passwordless private storage | Owner logs in and confirms host cannot read data | Before opening to friends |
| 2 Capture | Easy mobile entry sustains the habit | Owner captures spend for one full month | After first month of use |
| 3 Recurring | Fixed costs materially change the picture | Owner adds recurring costs and dashboard reflects them | After dashboard exists |
| 4 Dashboard | Visibility drives a decision | Owner names one cut after reviewing | After first month of data |
| 5 Guidance | Advice produces a saving action | Owner acts on one suggestion | After two review cycles |

## 5. Exclusions and Later Outcomes

- Bank/spreadsheet import with AI auto-categorization: Phase 2; adds ingestion and categorization risk beyond the core habit.
- Investment-portfolio tracking with email summaries: Phase 2; a different job from spending visibility.
- Multi-user onboarding of friends: deferred until single-user value and privacy are proven.

## 6. Constraints and Approval

- Human-stated technical constraint (for Lead Developer, not a product decision): Go backend + React frontend.
- Specialist briefs (BA, Lead Developer, QA) are not yet available; order may change once feasibility and effort are known.
- Open questions: North Star wording; guidance delivery (microservice vs export); encryption model expectations.
- Human verdict: pending. This roadmap is a recommendation awaiting explicit human approval. No delivery dates are implied.
