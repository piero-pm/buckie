# Epic Scope Contract: Private Spending-Visibility Loop (Phase 1 core)

| Field | Value |
| --- | --- |
| Status | Recommendation; human approval pending |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-10 |
| Supersedes | None |

## 1. Outcome

Reference: Buckie strategy v0.1 and outcome roadmap v0.1 (recommendations), roadmap outcomes 1-4, and the Impact Map trace. Epic JTBD: when I spend money during my day or week, I want to record it quickly and later see where my money goes each month, so I can spot overspending and steadily grow my savings.

## 2. Value and Evidence

- Actor and situation: a salaried spender/saver (the owner) at the moment of spending and at monthly review.
- Progress and value: fast capture plus monthly visibility that surfaces at least one saving decision.
- Current workaround/alternatives: memory, a bank app, spreadsheets, or doing nothing.
- Forces and anxieties: wants control and savings; resisted by capture effort and privacy fear.
- Evidence and confidence: one user (the owner); medium confidence; not market-validated.
- Falsifier: the owner captures a full month yet the dashboard prompts no saving action.

## 3. In Scope

- Passwordless login: user enters email, receives a code, and signs in.
- Per-user encrypted financial data such that a multi-user host cannot read another user's money data.
- Daily/weekly capture: record an amount and choose a category from a dropdown (e.g. bills, food, misc, gift, flight, rent).
- Recurring monthly fixed expenses known in advance (e.g. rent, subscriptions).
- Dashboard: month-on-month spending, spend-by-category charts, and a savings projection.
- Responsive behavior for iPhone mobile browser and desktop browser; open-source and self-hostable.

## 4. Out of Scope

- User-invoked periodic guidance: recommended as the next Phase 1 epic; excluded here to keep this loop cohesive.
- Bank/spreadsheet import with AI auto-categorization: Phase 2 future value only.
- Investment-portfolio tracking with email summaries: Phase 2 future value only.
- Multi-user onboarding of friends: deferred until single-user value and privacy are proven.
- Native mobile app: explicitly not wanted; responsive web only.

## 5. Outcome Acceptance

- The owner can log in without a password and reach their own private data.
- The owner can record a spend with amount and category in seconds on a phone browser.
- The owner can register recurring monthly expenses that persist across months.
- The owner can view a dashboard showing this month versus prior months, category breakdown, and a savings projection.
- Data is stored with per-user encryption; in a multi-user deployment the host cannot read another user's financial data. BA later translates these into rules, examples, and Gherkin.

## 6. Specialist Constraints

| Source | Constraint or risk | Effect on scope/order |
| --- | --- | --- |
| BA | Business rules, category set, and data-quality rules not yet elaborated | Capture/recurring detail pending |
| Lead Developer | Feasibility of per-user encryption, passwordless flow, and Go+React stack unassessed | May reshape acceptance and order |
| QA | Quality risk for privacy and data integrity not yet assessed | May add verification before approval |

## 7. Change Control

Changes that preserve this outcome require a documented request and a superseding version of this contract. A new independent outcome (for example, periodic guidance) becomes a separate epic.

## 8. Decisions and Approval

- Assumptions: privacy and low friction drive adoption; per-user encryption is achievable at low cost; one user represents the target job.
- Rejected alternative: bundling guidance and imports into this epic; excluded to keep the loop small and testable.
- Unresolved questions: encryption model expectations (Lead Developer); category taxonomy (BA); guidance delivery (later epic).
- Human verdict: pending. This contract is a recommendation awaiting explicit human approval.
