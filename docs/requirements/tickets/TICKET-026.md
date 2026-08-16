# TICKET-026: Taxonomy expansion and capture quick-pick chips

Status: approved with WORK-003 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Capture (REQ-24, BR-TAX-1, BR-INC-4, BR-CAP-1) |
| Spec | [../delivery-spec-home-prediction.md](../delivery-spec-home-prediction.md) |
| Outcome | WORK-003 — general everyday spending |
| Sequence | WORK-003 Slice 2 — first |
| Depends on | TICKET-005/006 capture, BA-DS-006 income kinds |

## Intent

As a user recording everyday spending I want one-tap access to my usual
categories and a broader everyday taxonomy, so capture stays light — not
a bank — while covering real life.

## Behavior

Expense taxonomy grows from 8 to 14 fixed categories (superset — no data
migration): existing Rent, Bills, Food, Transport & Travel, Health,
Shopping, Gift, Miscellaneous plus Entertainment & Subscriptions, Personal
care, Education & Books, Pets, Family & Kids, Insurance. Income kinds
become salary, freelance, investments (stocks), other — with savings kept
for existing records. The capture form renders the user's top 6
most-used categories as quick-pick chips (fallback: fixed defaults) above
the searchable dropdown; one tap selects.

## Acceptance

- Given a user with history, when the capture form opens, then their top
  6 categories render as chips and one tap selects (EX-CAP-1).
- Given a user without meaningful history, then fixed default chips
  render instead.
- Given any user, then all 14 categories remain reachable via the
  searchable dropdown (BR-TAX-1).
- Given existing expense or income records, then no migration occurs and
  all old values remain valid selections.

## Out of scope / notes

Client-side only — records are encrypted blobs; taxonomy lives in
taxonomy.ts and income kinds in domain/income.ts. User-defined categories
stay excluded. Chips derivation helper unit-tested. User-defined
categories remain excluded per BA-DS-008 §6.
