# Work State: Buckie Initial Product

| Field | Value |
| --- | --- |
| ID | WORK-001 |
| Status | In progress |
| Active project | buckie |
| Request class | New project |
| Current stage | Developer (Slice 2) |
| Next owner | Developer |
| Updated | 2026-08-10 |

## 1. Request and Route

Define and deliver Phase 1 of Buckie: a low-cost, open-source, responsive web
service for private expense capture, recurring expenses, spending dashboards,
projections, and user-invoked periodic guidance. Start with product problem and scope
authority because outcomes, MVP boundaries, privacy promises, and AI inclusion remain
unsettled.

Route (revised 2026-08-10): Product Owner (done) -> Business Analyst (PRD/tickets) ->
Lead Developer (delivery brief + hosting) -> Developer (implementation) -> Lead review.
UX is folded into BA/Lead inline (human waiver); QA is waived (human verifies manually).

Explicitly excluded from Phase 1 intake: spreadsheet import and investment portfolio
tracking. Their future value may be recorded, but they must not enter delivery scope
without later human approval.

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Use seven canonical roles for Buckie | Human | Approved | User message, 2026-07-24 |
| Run specialists via in-editor subagents, not llm-delegate MCP | Human | Approved | User message, 2026-08-10 |
| Models: PO/BA/Lead/review -> Opus 4.8; Developer -> Sonnet 4.6 | Human | Approved | User message, 2026-08-10 |
| Phase 1 strategy, North Star, and epic scope | Human | Approved | User message, 2026-08-10 |
| Periodic guidance stays a separate second epic | Human | Approved | User message, 2026-08-10 |
| Login method: passwordless email code (no SMS) | Human | Approved | User message, 2026-08-10 |
| Public landing page (marketing surface) - expands interface-system.md marketing exclusion | Human | Approved | User message, 2026-08-12 |
| Expected Phase 1 user count: about 5 | Human | Noted | User message, 2026-08-10 |
| PRD: analysis brief, 4 delivery specs, traceability, 15 tickets | Human | Approved | "Start implementation", 2026-08-10 |
| Rule defaults: categories (Flight into Transport), ~~GBP~~ EUR (updated 2026-08-11), 10-min code/5 tries/30-day session, amount<=1e6 and date<=2yr and duplicate-warn, projection from average monthly savings | Human | Approved | "Start implementation" adopts recommended defaults, 2026-08-10; currency changed to EUR 2026-08-11 |
| Privacy: client-side passphrase-derived encryption (host-blind); dashboards client-side; email-OTP auth retained; encryption method revisited later | Human | Approved | User message, 2026-08-10 |
| Lead brief v0.2 + ADR-001 (SQLite), ADR-002 (host-blind, passphrase-loss=data-loss, >=12 chars), ADR-003 (Argon2id + AES-256-GCM + WASM) | Human | Approved | "build slice 1", 2026-08-10 |
| Code host linked: GitHub trunk main pushed to piero-pm/buckie | Human | Done | git push, 2026-08-10 |

Stage waivers (human-approved 2026-08-10): QA waived - human verifies manually; UX
reduced - apply UX inline, no semantic-interface rendering.

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | User intake, constitution | Strategy, roadmap, epic-scope approved | BA elaborates PRD/tickets |
| Business Analyst | Passed | Approved epic scope | PRD + 15 tickets approved | Lead sets technical direction |
| UX Designer | Excluded | n/a | Waived: UX applied inline, no rendering | n/a |
| Lead Developer | Passed | Approved PRD + tickets; passphrase privacy decision | Brief v0.2 + ADR-001/002/003 approved (Opus 4.8) | Dev builds Slice 1 |
| Developer | Built | TICKET-003..016 + client crypto | Slice 1+2 integrated (ea92b3b, e404961); Slices 3-6 + SMTP built, gates green (36 frontend + 16 backend tests), awaiting Lead review | Lead review before push |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Required: focused deterministic checks, independent QA verdict, Lead review when its
canonical triggers apply, accurate documentation, tested recovery where applicable,
and trunk-based integration evidence.

Slice 1 gate run (2026-08-10, local): backend go build/vet green, gofmt -l empty,
go test ./... ok (internal/auth). Frontend npm ci ok, lint clean, prettier clean,
vitest 5/5 pass, vite build ok. Lead review (Opus 4.8) 2026-08-10: "Approve with
follow-ups" - no blocking findings, EX-LOGIN-1..4 + attempt-cap + uniform unknown-
email + BR-CONF-1 isolation all test-covered; security posture meets brief S5.
Integrated: pushed to origin/main at ea92b3b (.gitattributes LF fix applied).

Slice 2 gate run (2026-08-11, local, ZCode/GLM-5.2): backend go build/vet green,
gofmt -l empty, go test ./... ok (internal/auth + internal/vault). Frontend npm ci
ok, lint clean, prettier clean, vitest 13/13 pass (8 crypto: derive/encrypt/decrypt/
wrong-passphrase/tamper/keystore; 5 App routing incl. EX-PASS-3 cached-key-to-home),
vite build ok (165 kB / 54 kB gzip, 48 modules). All new source files <=200 lines,
all Go functions <=30 lines (clean-artifacts). ADR-003 library note: hash-wasm
rejected (no Argon2 export in published 2.6.0); @noble/hashes argon2id adopted —
deviation from the ADR's "WASM" wording flagged for Lead review. NOT yet integrated:
awaiting Lead review (Slice 2 touches crypto + a security ADR, a review trigger).

Slice 2 integrated 2026-08-11: Lead approved; pushed to origin/main (42f8c35..e404961).

Slices 3-6 + SMTP gate run (2026-08-11): backend go build/vet green, gofmt -l empty,
go test ./... ok (auth + records + vault; SMTP sender via net/smtp, env-configured,
DEV_MODE still logs). Frontend lint clean, prettier clean, vitest 36/36 pass
(5 routing, 8 crypto, 23 domain: validation BR-DQ-1..4, duplicate detection,
recurring expansion incl. EX-REC-2 day-31 clamping, monthly totals, category
breakdown, savings projection), vite build ok (178 kB / 58 kB gzip, 57 modules).
Tickets delivered: 005 capture, 006 taxonomy, 007 validation, 008 duplicate warn,
009 edit/delete, 010 recurring register, 011 monthly expansion, 012 end recurring,
013 month totals, 014 category breakdown, 015 projection. Currency = EUR
(updated from GBP per human, 2026-08-11). Domain logic all client-side over
decrypted records; server stores only ciphertext (delivery-brief §3 / ADR-002).

Lead follow-ups (non-blocking backlog, route to BA to ticket):
1. npm dev-tool advisory chain (esbuild/vite/vitest, GHSA-67mh-4wv8-2f99, dev-server
   only); revisit at next low-risk frontend upgrade (breaking vite@8).
2. verify-code timing side-channel (unknown vs known email) - revisit if ever public.
3. rate-limiter map unbounded - add expired-window eviction in a later slice.
4. optional: extract verifyCode switch helper (~31 lines); frontend 429 handling.

## 5. Blocker and Restart

Resolved 2026-08-10. The human approved a qualified model-assignment change: specialists
run through the in-editor named subagents instead of the `llm-delegate` MCP. Approved
models: Product Owner and Lead Developer on Claude Opus 4.8, Developer on Claude Sonnet
4.6. BA, UX, and QA model assignments remain to be confirmed at their stages. This
session deviation overrides `pipeline/runtime/models.yaml`; the human may make it
permanent by editing that file directly. No active blocker.

## 6. Completion

Pending delivery and verification.