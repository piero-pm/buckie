# Technical Delivery Brief: Penny Saver Epic A — Private Spending-Visibility Loop

| Field | Value |
| --- | --- |
| ID | LD-TDB-001 |
| Status | Recommendation; human approval pending |
| Owner | Human |
| Version | 0.2 |
| Approved behavior | [analysis-brief](../requirements/analysis-brief.md) |

## 1. Outcome and Boundaries

Deliver the approved login → capture → recurring → dashboard loop for ~5 self-hosted
users at low cost, now with host-blind confidentiality. In scope: the 15 tickets, their
acceptance examples, and client-side passphrase setup. Excluded: Epic B, Phase 2
import/portfolio, native app. Smallest useful slice: a user requests an email code and
starts a private session (Slice 1). Standards: clean-artifacts, trunk-based-development.
No production code is written in this brief.

## 2. Evidence and Decisions

- Facts: Go + React, open-source, self-hostable, low cost, ~5 users, GBP, defaults
  (code 10 min / 5 attempts / 30-day session), fixed taxonomy, QA and UX folded to human.
- Approved 2026-08-10: host-blind, client-side passphrase encryption [ADR-002](../adr/ADR-002.md).
  Email-OTP is login/session only; a separate >= 12-char passphrase derives the data key.
- Recommended (approval pending): SQLite store [ADR-001](../adr/ADR-001.md);
  Argon2id + AES-256-GCM client crypto [ADR-003](../adr/ADR-003.md).
- Consequence: server holds only ciphertext; validation, dedup, recurring expansion, and
  all dashboard aggregation move client-side. Passphrase loss = data loss.
- Unknowns (BA-owned, confirm before dependent slice): final taxonomy; projection method;
  whether passphrase-setup UX needs its own ticket (route to BA/PO).

## 3. Technical Direction

Monorepo: `backend/` (Go) and `frontend/` (Vite + React SPA); the Go binary serves the
built SPA and the API on one port (cheapest host). The server is a per-user authenticated
ciphertext store plus auth/session — it never sees plaintext, passphrase, or data key.
Backend packages: auth (OTP + session), and a generic per-user encrypted-record store
(opaque blobs keyed by user_id + type + id, with non-secret salt/KDF params). Client
owns domain logic: a crypto module (Argon2id derive, AES-GCM encrypt/decrypt, device key
cache), plus validation, duplicate detection, recurring expansion, and aggregation over
decrypted records. Auth: request-code hashes a 6-digit code with expiry + attempt cap,
emails it via transactional SMTP; verify issues an HttpOnly+Secure+SameSite session
cookie. Every store query is user_id-scoped. New services justified: none.

## 4. Delivery Sequence

| Slice | Observable result | Tickets | Depends | Handoff |
| --- | --- | --- | --- | --- |
| 1 | Request code, verify, empty private session | 001, 002 | Skeleton + email | Developer |
| 2 | Stay signed in, sign out, isolation + passphrase setup & client crypto | 003, 004 (+crypto) | Slice 1 | Developer |
| 3 | Record expense: client validation, encrypt, store ciphertext | 005, 006, 007 | Slice 2 | Developer |
| 4 | Client-side duplicate warning, review/edit/delete | 008, 009 | Slice 3 | Developer |
| 5 | Recurring: encrypted templates, client-side monthly expansion | 010, 011, 012 | Slice 3 | Developer |
| 6 | Dashboard: client-side totals, category, projection | 013, 014, 015 | Slices 3, 5 | Developer |

Passphrase setup + the client crypto module land in Slice 2 — before any expense is
stored (Slice 3), so no plaintext is ever persisted. Slice 1 (concrete): walking skeleton
(repo shape, Go API, SPA served, SQLite, CI, deploy) plus TICKET-001 + 002. Observable: on
the deployed app a user enters an email, receives a code, enters it, and reaches an empty
private home; wrong or expired codes are refused. Tests: unit (code issue/verify/expiry/
attempt cap), API integration for EX-LOGIN-1..4, uniform response for an unknown email.
Integration checks: §6 gates green; deploy smoke test passes. Rollback: redeploy the prior
binary; no user data yet, DB file preserved. Later slices stay directional until reviewed.

## 5. Quality and Operations

Test boundaries (QA waived → human verifies): backend unit tests for auth lifecycle and
opaque-store scoping; frontend crypto unit tests (derive, encrypt, decrypt, wrong-
passphrase, tamper) and client validation/dedup/aggregation math; API integration tests
mapping 1:1 to acceptance examples; an automated two-user isolation test asserting the
server returns only ciphertext. Security/privacy: hashed codes, expiry + attempt cap, no
account enumeration, code-request rate limit, HttpOnly+Secure+SameSite cookies, server-
side sessions, mandatory user_id scoping, ciphertext-only storage, non-extractable device
key, TLS, secrets in env. Signals: structured auth/email logs, health endpoint, error
logs, SQLite file backup. Deployment: single binary behind Caddy (auto-TLS) on one small
VPS. Rollback: redeploy the prior artifact; forward-only migrations recoverable from backup.

## 6. Repository Integration Checks (pre-trunk)

Backend: `go build ./...`, `go vet ./...`, `gofmt -l` (must be empty), `go test ./...`.
Frontend: `npm ci`, `npm run lint`, `prettier --check`, `npm run test` (incl. crypto
tests), `npm run build`. All must pass locally and in CI before integrating to trunk.

## 7. Risks, Approval, and Handoff

Consequential decisions needing human approval:
1. Host-blind client-side encryption (ADR-002): approve; accept passphrase-loss = data-loss
   and the >= 12-char passphrase policy; accept added client complexity.
2. Client KDF/cipher/library (ADR-003): approve Argon2id + AES-256-GCM + WASM dependency.
3. Data store (ADR-001): approve SQLite over Postgres.
4. Hosting + budget (below); email provider (a third party processes sign-in emails);
   single-binary monolith serving the SPA.

Registration (what/when): now — code host (GitHub, free). Before Slice 1 deploy — one
small VPS (e.g. Hetzner ~£5/mo), a domain (~£10/yr), a transactional email account (free
tier, e.g. Resend/Brevo). None needed for DB (SQLite) or a separate frontend host; TLS via
Caddy (free). Est. total ≈ £5–6/month + ~£10/year domain.

Everything above is a recommendation; no production code was written; awaiting explicit
human approval.
