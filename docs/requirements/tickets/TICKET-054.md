# TICKET-054: One chart palette across dashboard charts

Status: built (7e9c67f), awaiting production verification — 2026-08-19

| Field | Value |
| --- | --- |
| Behavior | Unified visual identity — dashboard charts (REQ-37, BR-VI-8..11, 13) |
| Spec | [../delivery-spec-visual-identity.md](../delivery-spec-visual-identity.md) |
| Outcome | WORK-008 — visual identity |
| Sequence | WORK-008 Slice 2 |
| Depends on | TICKET-053 (palette + tokens) |

## Intent

As a user I want every chart to read at a glance (spend vs saved,
category identity stable across months and views), so the dashboard
tells one story instead of six.

## Behavior

Stable category→color map (16 + legacy, rust-shade scale, segments
distinguishable without legend) + fixed bucket colors
(Fixed/Everyday/Social/Lifestyle) from `theme/palette.ts`. Donut: stable
colors, % of total per row, 1:1 swatches. Sankey: flow opacity raised,
Saved flow vault-green, values on primary flows. Month-on-month: direct
recharts (approved exception) — bar data labels, even-increment ticks,
rust bars, mono axes, formatMoney. TrendView: direct recharts — solid
actual, dashed lower-opacity projected, shaded projection band, single
boundary tick. HeatmapCard rust ramp; CategoryTrendCard fixed bucket
colors; mono axis CSS.

## Acceptance

- A category keeps its color across months and views.
- Donut list shows amount + % with matching swatch.
- Sankey Saved visibly vault-green; primary flows show values; links
  readable on paper (contrast recorded).
- Bars carry data labels; axis ticks at even increments; no hardcoded €.
- Projected segment dashed + banded; no duplicated month tick.
- Trend/category-trend tests stay green; new tests for stable color +
  duplicate-tick fix.

## Out of scope / notes

Lists/semantic sweep (S3). 12-month trend range confirmed against seed
data (expected: sparsity, not truncation).
