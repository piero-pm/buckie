# TICKET-017: White + orange theme

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Visual identity (REQ-17, BR-THM-1) |
| Spec | [../delivery-spec-site-chrome.md](../delivery-spec-site-chrome.md) |
| Outcome | WORK-002 — technical open-source identity |
| Sequence | WORK-002 Slice 1 — first |
| Depends on | none (Epic A live) |

## Intent

As the owner, I want Buckie to look like a technical open-source project —
white surfaces with a deep-orange primary — so the product identity matches
how it is built: transparent, self-hostable, no dark patterns.

## Behavior

The Mantine theme primary becomes a deep orange tuned so white-on-primary text
meets WCAG 2.2 AA; page background becomes white. All hardcoded indigo values
(theme tuple, landing hero gradient and text, dashboard chart colors, hub
navigation buttons) move to the orange palette. A favicon is added (currently
none exists — browsers show a default icon). The duplicate-spend warning is
recolored so a warning never reads as brand-primary emphasis.

## Acceptance

- Given the app on white surfaces, when primary text or filled buttons render,
  then contrast meets WCAG 2.2 AA (EX-THM-1).
- Given the landing page, when the hero renders, then the gradient and CTA
  use the orange identity with readable text.
- Given the dashboard, when donut and bar charts render, then slices use the
  orange/amber palette and stay distinguishable with a synced legend.
- Given any screen, when no indigo remnant appears, then the re-theme is
  complete (grep for the old palette returns nothing user-facing).
- Given a browser tab, when the site loads, then the orange favicon shows.

## Out of scope / notes

Dark mode stays excluded (interface-system.md: light theme only). Marketing
copy is unchanged; only palette and favicon. Lead note: charts use literal
hex arrays for stable category colors — replace as a set, keep legend in sync.
