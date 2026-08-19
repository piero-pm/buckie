# TICKET-055: Lists, semantic colors, sweep, contrast record

Status: approved with WORK-008 direction 2026-08-19

| Field | Value |
| --- | --- |
| Behavior | Unified visual identity — lists + semantics (REQ-37, BR-VI-6, 7, 12) |
| Spec | [../delivery-spec-visual-identity.md](../delivery-spec-visual-identity.md) |
| Outcome | WORK-008 — visual identity |
| Sequence | WORK-008 Slice 3 — last |
| Depends on | TICKET-053 (tokens), TICKET-054 (palette) |

## Intent

As a user I want the app's text surfaces (summary, lists, other pages)
to speak the same visual language as the charts, so the whole product
reads as one design.

## Behavior

MonthExpenseList: outline category icon per row (CategoryIcon map, 16
categories), RECURRING as small amber pill, hairline --line dividers,
right-aligned mono amounts. DashboardSummary: Fraunces hero total; net
vault-green/rust; SavedBar saved figure vault-green; pace sentence
untouched. ExpectedVsActual/SavedBar: over = rust-deep, under/saved =
vault-green. Sweep hardcoded #e9ecef dividers (AppHeader, BrowserRow,
IncomePage, IncomeEvents, RecurringPage) to --line. Warm-gray Mantine
tuple makes existing gray.6/7 text warm ink automatically (S1).

## Acceptance

- Expense rows show category icon; RECURRING is an amber pill; amounts
  mono, right-aligned; rows divided by hairlines.
- Saved/under states render vault-green; over states rust-deep.
- Zero #e9ecef in frontend source.
- WCAG contrast table (computed ratios: ink/ink-soft/rust/vault-green
  on paper and paper-deep; vault-text/amber/green-soft on vault-bg;
  paper-on-rust button label) recorded in this ticket; deviations
  flagged to the human.

## Out of scope / notes

Other pages inherit the theme via S1 Card/body defaults — spot-check
only. Onboarding/auth pages same. No copy changes beyond S1.
