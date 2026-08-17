# TICKET-036: Taxonomy 16 in buckets + soft legacy

Status: approved with WORK-005 direction 2026-08-17

| Field | Value |
| --- | --- |
| Behavior | Taxonomy (REQ-28, BR-TAX-2..3) |
| Spec | [../delivery-spec-expected-actual.md](../delivery-spec-expected-actual.md) |
| Outcome | WORK-005 — expected vs actual |
| Sequence | WORK-005 Slice 1 — first |
| Depends on | None |

## Intent

As a user I want clear separated buckets for groceries and restaurants
(grouped under needs and social), so expected-vs-actual and charts speak
my language.

## Behavior

The category taxonomy becomes 16 categories in four buckets — Fixed:
Rent, Bills, Insurance; Everyday: Groceries, Transport & Travel, Health,
Personal care, Pets; Social: Restaurants & drinks, Entertainment &
culture, Gifts, Family & kids; Lifestyle: Shopping & clothes,
Subscriptions, Education & books, Miscellaneous. Capture offers the 16
grouped by bucket. Legacy stored values "Food" and "Entertainment &
Subscriptions" still display and aggregate (bucketed Everyday and
Social) but are not offered for new capture.

## Acceptance

- Given capture, then the category select shows the 16 grouped by
  bucket, without "Food" or "Entertainment & Subscriptions".
- Given an expense stored with "Food", then lists, donut, and bucket
  aggregation still include it under Everyday (EX-EA-4).
- Given validation, then all 16 plus the two legacy values pass.

## Out of scope / notes

taxonomy.ts restructure (BUCKETS + 16 CATEGORIES + LEGACY list);
aggregation gains bucketFor(category) with legacy mapping; quick-pick
chips update to most-used of the new set. Zero server change. Update
affected tests (taxonomy/expense/aggregation).
