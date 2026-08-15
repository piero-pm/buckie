# Delivery Specification: Site Chrome — Theme, Header, Help

Status: approved with WORK-002 plan 2026-08-16 (user-originated intake)

| Field | Value |
| --- | --- |
| ID | BA-DS-005 |
| Owner | Human |
| Version | 0.1 |
| Date | 2026-08-16 |
| Epic scope | [../product/epic-scope.md](../product/epic-scope.md) |

## 1. Outcome and Benefit

A white + deep-orange visual identity that reads as a technical open-source
tool, a persistent top header that keeps every destination one tap away, and a
Help page that is a durable plain-language reference for how Buckie works and
how privacy is protected. Benefit: immediate orientation and trust.

## 2. Behavior

Signed-out visitors see a top header with the Buckie brand and a Log in
action. Signed-in users see the same header with Expenses, Income (BA-DS-006),
and Help destinations plus sign-out; Dashboard and Recurring stay on the home
hub. The header persists on desktop and iPhone Safari (icon-only labels on
small screens) and never collapses into a hidden (burger) menu. Help explains
the capture -> recurring -> dashboard loop and the encryption model.

## 3. Rules and Examples

BR-THM-1: light theme only; white surfaces; deep-orange primary with text
contrast meeting WCAG 2.2 AA.
BR-NAV-1: exactly one persistent header; no burger navigation; the logged-out
header offers only brand + Log in.
BR-HLP-1: Help explains the product loop and the encryption/privacy model,
including the no-recovery consequence of losing the passphrase.

```gherkin
Scenario: Logged-out header (EX-NAV-1)
  Given a visitor on any signed-out screen
  When they view the header
  Then the Buckie brand and a Log in action are visible
  And Log in opens the existing email-code login flow

Scenario: Signed-in header (EX-NAV-2)
  Given a signed-in unlocked user
  When they use the header destinations
  Then Expenses, Income, and Help switch views and sign-out ends the session

Scenario: Theme contrast (EX-THM-1)
  Given the re-themed interface
  When primary-colored text or filled buttons render on white surfaces
  Then contrast meets WCAG 2.2 AA

Scenario: Help reference (EX-HLP-1)
  Given a signed-in user
  When they open Help
  Then how Buckie works and the privacy/encryption model are explained
  And the passphrase-loss consequence is stated plainly
```

## 4. Acceptance Boundary

Confirmed when the header renders per auth state at desktop and iPhone
widths, every destination is reachable in one tap, the theme is applied with
AA contrast, and Help content is complete. Verification: human, manual
(QA waived).

## 5. Dependencies and Constraints

Depends on Epic A login/home (BA-DS-001). Constrained by interface-system.md
(Mantine v7 default renderer, Tabler icons, light theme only, responsive
desktop + iPhone Safari). State-based views continue; no routing library.

## 6. Exclusions and Open Decisions

Excludes dark mode, marketing copy changes beyond palette, and URL-based
routing. Open: none — header contents and no-burger pattern approved
2026-08-16.

## 7. Traceability and Approval

Source: user intake 2026-08-15; work-state-002 §2. Rules BR-THM-1, BR-NAV-1,
BR-HLP-1. Examples EX-NAV-1..2, EX-THM-1, EX-HLP-1. Approved with the
WORK-002 plan, 2026-08-16.
