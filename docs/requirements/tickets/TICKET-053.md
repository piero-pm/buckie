# TICKET-053: Design tokens, fonts, landing rebuild

Status: deployed 2026-08-19 (dd9e347) — awaiting production manual checks

| Field | Value |
| --- | --- |
| Behavior | Unified visual identity — foundation + landing (REQ-37, BR-VI-1..5) |
| Spec | [../delivery-spec-visual-identity.md](../delivery-spec-visual-identity.md) |
| Outcome | WORK-008 — visual identity |
| Sequence | WORK-008 Slice 1 — first |
| Depends on | none |

## Intent

As a visitor I want the landing page to show — not just claim — the
privacy and visibility promises, so I understand what myBuckie is
before signing in.

## Behavior

Token foundation (CSS vars + TS constants + Mantine theme: rust
primary tuple, warm-gray tuple, Fraunces/Inter/Plex Mono via
@fontsource, paper body, noise overlay, rust favicon). Landing rebuilt
as components: Hero (eyebrow, Fraunces headline, filled-rust "Get
started free" -> /login, "Sign in" text link, trust line), VaultCard
(type->scramble loop, reduced-motion static, aria-hidden), FeatureLedger
(4 hairline rows, mono tags), DashboardPreview (real categories, stable
palette, sparkline, insight line, "Example data — not a real account"),
Footer. AppHeader: Fraunces brand, paper bg, line border, "Sign in".

## Acceptance

- Landing renders hero + vault card + 4 ledger rows + preview + footer.
- Vault card animates; with prefers-reduced-motion it renders static
  encrypted rows (no timers).
- Preview carries the example-data caption; no GitHub star badge.
- One filled CTA; sign-in is a text link; both reach /login.
- App.test copy assertions updated; new landing tests green.

## Out of scope / notes

Dashboard re-theme (S2/S3). Palette module itself lands with S1 as
`theme/palette.ts` (preview needs stable category colors) and is
consumed by charts in S2.
