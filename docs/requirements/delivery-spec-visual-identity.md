# Delivery Spec: Visual identity — landing + dashboard unify

| Field | Value |
| --- | --- |
| ID | BA-DS-013 (user-authored; BA stage waived for WORK-008) |
| Status | Approved (human direction gate 2026-08-19) |
| Author | Human (two task prompts + mybuckie-landing-concept.html reference) |
| Outcome | WORK-008 — REQ-37 unified visual identity |

Condensed from the user's two task prompts (2026-08-19) and the static
concept mockup; this digest is the actionable rule set.

## 1. Design tokens (single source, both surfaces)

--paper #FAF3E7 (page bg) · --paper-deep #F1E6D3 (cards) · --ink #2A231C
· --ink-soft #6B6055 · --rust #BB4E1F (primary/CTA/spend) · --rust-deep
#8F3B15 (hover) · --vault-green #3F5A44 (saved/positive) ·
--vault-green-soft #6B9C74 · --vault-amber #E08E4F (recurring/flagged) ·
--line #E2D3B8 (hairlines) · --vault-bg #211C16 (dark cards) ·
--vault-line #3A322A · --vault-text #E8DDC8.

Fonts (self-hosted @fontsource, human choice 2026-08-19 — no third-party
font requests on a privacy product): Fraunces (display serif, headlines,
hero numbers) · Inter (body/UI) · IBM Plex Mono (money, dates, tags,
ciphertext, chart axes).

Semantic color rule everywhere: rust = money out / over; vault-green =
saved / positive; amber = recurring / flagged.

## 2. Landing rebuild (reference: concept mockup)

- BR-VI-1 CTA hierarchy: filled rust "Get started free"; sign-in is a
  plain text link labeled "Sign in" (passwordless-accurate; supersedes
  "Access your space"/"Log in").
- BR-VI-2 Hero vault card: types sample expenses, visibly scrambles to
  hex ciphertext, loops; `prefers-reduced-motion` renders static
  encrypted state; aria-hidden.
- BR-VI-3 Feature ledger: 4 hairline rows (outline icon, title, body,
  mono tag encryption/capture/insight/hosting) replacing the card grid.
- BR-VI-4 Dashboard preview section (after the ledger): dark card —
  "this month" total in Fraunces, category breakdown with REAL app
  category names + stable palette colors, 6-month sparkline, insight
  line "At this rate, you're on track to save €X this year", caption
  "Example data — not a real account" (the operator can't see real
  numbers — a fake-looking live account would undercut the pitch).
- BR-VI-5 No fabricated social proof (no GitHub star badge at 0 stars).
  Trust line stays "open source · self-hosted · €0".

## 3. Dashboard unify (in-app, visual only)

- BR-VI-6 Shell: paper background, Inter body; cards paper-deep with
  --line hairline borders (no drop shadows). Warm-gray text tokens.
- BR-VI-7 Summary: "TOTAL THIS MONTH" as Fraunces hero number; saved
  figure vault-green; pace sentence preserved verbatim.
- BR-VI-8 Donut: rust-shade scale with distinguishable segments; stable
  category→color map (no month-to-month color shifts); % of total per
  list row; swatches map 1:1 to segments.
- BR-VI-9 Sankey: higher flow opacity/contrast (WCAG-motivated); Saved
  flow vault-green, spend flows rust shades; values on primary flows.
- BR-VI-10 Month-on-month bars: data labels, even-increment axis, rust
  bars, mono axis labels, currency-aware formatting.
- BR-VI-11 Balance actual vs projected: solid actual, dashed +
  lower-opacity projected, shaded projection band, single "today"
  boundary tick (no duplicate month label).
- BR-VI-12 Expense list: outline category icon per row; RECURRING amber
  pill; hairline dividers; right-aligned mono amounts.
- BR-VI-13 Category trends: fixed bucket colors across all views;
  confirm 12-month range renders.

## 4. Acceptance examples

- EX-VI-1 Landing: one filled rust CTA "Get started free"; "Sign in"
  is a plain text link; both reach /login.
- EX-VI-2 Vault demo animates type→scramble; reduced-motion shows
  static encrypted rows.
- EX-VI-3 Ledger: 4 hairline rows with mono tags replace the card grid.
- EX-VI-4 Preview: real category names + stable colors, sparkline,
  insight line, visible "Example data — not a real account" caption.
- EX-VI-5 Landing truthfulness: no star badge; trust line unchanged.
- EX-VI-6 Dashboard: charts readable per semantic rule at a glance
  (saved green, spend rust, labels present, stable colors).

## 5. Constraints

Responsive to mobile (iPhone Safari); visible keyboard focus states;
`prefers-reduced-motion` respected; WCAG 2.2 AA verified with computed
ratios, deviations flagged (filled-button label trade-off re-stated);
keep existing chart libraries (direct recharts where @mantine/charts
cannot deliver: bar data labels, projection band — Sankey precedent);
no backend/auth/data-model changes.
