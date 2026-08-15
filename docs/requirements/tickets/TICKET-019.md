# TICKET-019: Help page with privacy explainer

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Help + privacy reference (REQ-19, BR-HLP-1) |
| Spec | [../delivery-spec-site-chrome.md](../delivery-spec-site-chrome.md) |
| Outcome | WORK-002 — orientation + trust |
| Sequence | WORK-002 Slice 2 — with TICKET-018 |
| Depends on | TICKET-018 (header destination) |

## Intent

As a user I want one page that explains how Buckie works and exactly how my
privacy is protected, so I can understand (and show others) what the server
can and cannot ever see — and why a lost passphrase means lost data.

## Behavior

A static Help page is reachable from the header whenever signed in. It
explains the loop (capture expenses, register recurring, read the dashboard)
and the encryption model in plain language: the passphrase never leaves the
browser; it derives the key (Argon2id) that encrypts records (AES-256-GCM);
the server stores only ciphertext and can never read amounts, categories, or
income; losing the passphrase permanently loses the data — no recovery. It
links to the GitHub repository and self-hosting install docs.

The privacy section is a reusable component (PrivacyExplainer) so TICKET-021
onboarding stage 1 shows identical content.

## Acceptance

- Given a signed-in user, when they open Help from the header, then the
  product loop and privacy/encryption model are explained and the
  passphrase-loss consequence is stated plainly (EX-HLP-1).
- Given the privacy section, when it renders in Help or onboarding, then the
  content is the same shared component.
- Given the Help page, when the user wants the source or self-hosting, then
  links to the repository and install docs are present.

## Out of scope / notes

Static content only — no search, no CMS, no logged-out variant (header shows
Help only when signed in per EX-NAV-1). Content ≤ plain language, no jargon
without explanation. Kept under clean-artifacts size limits via the shared
component.
