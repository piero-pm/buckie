# TICKET-055: Lists, semantic colors, sweep, contrast record

Status: deployed 2026-08-19 (dd9e347) — awaiting production manual checks

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

## Contrast record (WCAG 2.2 AA, computed 2026-08-19)

| Pair | Ratio | AA (4.5 text / 3 non-text) |
| --- | --- | --- |
| ink #2A231C on paper #FAF3E7 | 14.04 | pass |
| ink on paper-deep #F1E6D3 | 12.54 | pass |
| ink-soft (gray.6) on paper | 5.55 | pass |
| ink-soft on paper-deep | 4.96 | pass |
| rust on paper (links/accents) | 4.51 | pass |
| rust-deep (over) on paper-deep | 6.06 | pass |
| vault-green (moss.6) on paper-deep | 6.17 | pass |
| white label on rust button | 4.97 | pass (old trade-off resolved — was ≈3.5 on orange) |
| vault-text on vault-bg | 12.56 | pass |
| vault-amber on vault-bg | 6.56 | pass |
| green-soft on vault-bg | 5.34 | pass |
| amber pill text amber.8 on amber.1 | 4.86 | pass |
| rust bar vs paper (non-text) | 4.51 | pass (≥3) |
| moss bar vs paper-deep (non-text) | 6.17 | pass (≥3) |

No deviations below AA remain in the re-themed pairs.
