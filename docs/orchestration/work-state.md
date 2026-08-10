# Work State: Penny Saver Initial Product

| Field | Value |
| --- | --- |
| ID | WORK-001 |
| Status | Awaiting approval |
| Active project | penny-saver |
| Request class | New project |
| Current stage | Lead Developer |
| Next owner | Human |
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

Stage waivers (human-approved 2026-08-10): QA waived - human verifies manually; UX
reduced - apply UX inline, no semantic-interface rendering.

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | User intake, constitution | Strategy, roadmap, epic-scope approved | BA elaborates PRD/tickets |
| Business Analyst | Passed | Approved epic scope | PRD + 15 tickets approved | Lead sets technical direction |
| UX Designer | Excluded | n/a | Waived: UX applied inline, no rendering | n/a |
| Lead Developer | Awaiting approval | Approved PRD + tickets; passphrase privacy decision | Brief v0.2 + ADR-002 (revised) + ADR-003 (Opus 4.8); host-blind client-side encryption | Human approves revised brief -> Dev builds Slice 1 |
| Developer | Awaiting approval | Approved ticket and delivery brief | Pending (Sonnet 4.6) | Implementation evidence |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Required: focused deterministic checks, independent QA verdict, Lead review when its
canonical triggers apply, accurate documentation, tested recovery where applicable,
and trunk-based integration evidence. Results are pending.

## 5. Blocker and Restart

Resolved 2026-08-10. The human approved a qualified model-assignment change: specialists
run through the in-editor named subagents instead of the `llm-delegate` MCP. Approved
models: Product Owner and Lead Developer on Claude Opus 4.8, Developer on Claude Sonnet
4.6. BA, UX, and QA model assignments remain to be confirmed at their stages. This
session deviation overrides `pipeline/runtime/models.yaml`; the human may make it
permanent by editing that file directly. No active blocker.

## 6. Completion

Pending delivery and verification.