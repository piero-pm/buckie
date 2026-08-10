# Work State: Penny Saver Initial Product

| Field | Value |
| --- | --- |
| ID | WORK-001 |
| Status | In progress |
| Active project | penny-saver |
| Request class | New project |
| Current stage | Lead review (Slice 1) |
| Next owner | Lead Developer |
| Updated | 2026-08-10 |

## 1. Request and Route

Define and deliver Phase 1 of Penny Saver: a low-cost, open-source, responsive web
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
| Use seven canonical roles for Penny Saver | Human | Approved | User message, 2026-07-24 |
| Run specialists via in-editor subagents, not llm-delegate MCP | Human | Approved | User message, 2026-08-10 |
| Models: PO/BA/Lead/review -> Opus 4.8; Developer -> Sonnet 4.6 | Human | Approved | User message, 2026-08-10 |
| Phase 1 strategy, North Star, and epic scope | Human | Approved | User message, 2026-08-10 |
| Periodic guidance stays a separate second epic | Human | Approved | User message, 2026-08-10 |
| Login method: passwordless email code (no SMS) | Human | Approved | User message, 2026-08-10 |
| Expected Phase 1 user count: about 5 | Human | Noted | User message, 2026-08-10 |
| PRD: analysis brief, 4 delivery specs, traceability, 15 tickets | Human | Approved | "Start implementation", 2026-08-10 |
| Rule defaults: categories (Flight into Transport), GBP, 10-min code/5 tries/30-day session, amount<=1e6 and date<=2yr and duplicate-warn, projection from average monthly savings | Human | Approved | "Start implementation" adopts recommended defaults, 2026-08-10 |
| Privacy: client-side passphrase-derived encryption (host-blind); dashboards client-side; email-OTP auth retained; encryption method revisited later | Human | Approved | User message, 2026-08-10 |
| Lead brief v0.2 + ADR-001 (SQLite), ADR-002 (host-blind, passphrase-loss=data-loss, >=12 chars), ADR-003 (Argon2id + AES-256-GCM + WASM) | Human | Approved | "build slice 1", 2026-08-10 |
| Code host linked: GitHub trunk main pushed to piero-pm/penny-saver | Human | Done | git push, 2026-08-10 |

Stage waivers (human-approved 2026-08-10): QA waived - human verifies manually; UX
reduced - apply UX inline, no semantic-interface rendering.

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | User intake, constitution | Strategy, roadmap, epic-scope approved | BA elaborates PRD/tickets |
| Business Analyst | Passed | Approved epic scope | PRD + 15 tickets approved | Lead sets technical direction |
| UX Designer | Excluded | n/a | Waived: UX applied inline, no rendering | n/a |
| Lead Developer | Passed | Approved PRD + tickets; passphrase privacy decision | Brief v0.2 + ADR-001/002/003 approved (Opus 4.8) | Dev builds Slice 1 |
| Developer | Passed | Approved brief + TICKET-001/002 | Slice 1 built (Sonnet 4.6); gates green; committed local, not pushed | Lead review before trunk push |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Required: focused deterministic checks, independent QA verdict, Lead review when its
canonical triggers apply, accurate documentation, tested recovery where applicable,
and trunk-based integration evidence.

Slice 1 gate run (2026-08-10, local): backend go build/vet green, gofmt -l empty,
go test ./... ok (internal/auth). Frontend npm ci ok, lint clean, prettier clean,
vitest 5/5 pass, vite build ok. Committed local (4 commits ahead of origin/main),
not pushed. Open flags for Lead: npm dev-tool advisory chain (esbuild/vite/vitest,
GHSA-67mh-4wv8-2f99, dev-server only, fix = breaking vite@8); add .gitattributes to
pin LF line endings. Push held until Lead review passes.

## 5. Blocker and Restart

Resolved 2026-08-10. The human approved a qualified model-assignment change: specialists
run through the in-editor named subagents instead of the `llm-delegate` MCP. Approved
models: Product Owner and Lead Developer on Claude Opus 4.8, Developer on Claude Sonnet
4.6. BA, UX, and QA model assignments remain to be confirmed at their stages. This
session deviation overrides `pipeline/runtime/models.yaml`; the human may make it
permanent by editing that file directly. No active blocker.

## 6. Completion

Pending delivery and verification.