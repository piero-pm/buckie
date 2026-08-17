# Work State: Data Safety — Backup, Passphrase Change, Lock on Sign-Out

| Field | Value |
| --- | --- |
| ID | WORK-004 |
| Status | Completed 2026-08-17 — deployed, verified (manual checks passed), §6 recorded |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Deployed — human manual verification (§4 checklist) |
| Next owner | Human |
| Updated | 2026-08-17 |

## 1. Request and Route

(1) Close the data-safety gaps surfaced by the 2026-08-16 implementation
review: signing out must clear the cached encryption key (lock); the user
can export an encrypted backup bundle and restore it (recovery kit,
device/server migration); the user can change the passphrase. (2) The
deferred fast-follows from work-state-003 §5: PUT request-size limit and
/health endpoint, plus the upsert kind-update defect. (3) Quick wins:
landing "~£5/mo" copy in the EUR app; dashboard month selector omits an
empty current month.

Route: user-originated intake (PO satisfied by direct human request,
WORK-003 precedent) -> Business Analyst (BA-DS-009) -> Lead Developer
(slice direction) -> Developer. UX folded inline; QA waived (human
verifies manually) per WORK-001 standing waivers.

Precondition: WORK-003 Slice 3 push is still pending human approval;
WORK-004 slices deploy only after S3 is pushed (trunk deploys green).

## 2. Approvals and Waivers

| Decision or waiver | Owner | Status | Evidence |
| --- | --- | --- | --- |
| Work direction: data-safety package; WORK-005..007 roadmap (§5) | Human | Approved | Review + plan approval, 2026-08-16 |
| BA-DS-009 data-safety material rules (all 15; BR-IMP-4 backup-wins) | Human | Approved | AskUser gate answers, 2026-08-16 |
| 3-slice direction + TICKET-030..035 | Human | Approved | AskUser answer, 2026-08-16 (start S1) |
| UX stage | Human | Waived | Standing waiver WORK-001 (UX inline) |
| QA stage | Human | Waived | Standing waiver WORK-001 (manual verification) |
| Slice pushes (production deploy) | Human | Approved | AskUser answer 2026-08-17: push all 5 (WORK-003 S3+seed included). eaf8b50 pushed; two trunk repairs followed (below); deploy green at 36728ef |
| Manual verification (production) | Human | Passed | User confirmation 2026-08-17: export/import round trip, passphrase change, sign-out lock, iPhone Safari — all pass |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake + review findings | Scope §1 | BA elaborates |
| Business Analyst | Passed | BA-DS-001/007 + review evidence | BA-DS-009 approved; traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved BA-DS-009 | 3-slice direction + TICKET-030..035 approved | Developer starts S1 |
| Developer | Passed | Tickets 030-035 | S1 2e00d77, S2 e157d1b, S3 (this commit) — all gates green | Push approval + human verification |
| Quality Assurance | Excluded | n/a | Waived: human verifies manually | n/a |

## 4. Integration Gates

Slices: S1 = TICKET-030 server hardening (413 size limit, /health,
upsert kind) + TICKET-031 lock and quick wins (sign-out clears key,
landing copy, empty-month selector). S2 = TICKET-032 export bundle +
TICKET-033 import restore. S3 = TICKET-034 vault overwrite endpoint +
TICKET-035 passphrase-change flow.

Gate = frontend lint/prettier/vitest/build + backend go
build/vet/gofmt/test + clean-artifacts sizes (mirror WORK-003 §4). Push
needs human approval (production deploy). Manual production verification:
export -> import round trip, passphrase change on a test account,
oversized PUT rejected, /health behind Caddy, sign-out then sign-in asks
for the passphrase, iPhone Safari spot-check.

### 4.1 Slice 1 gate evidence (2026-08-16, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; 33/33 tests incl. 3 new (413 oversize,
/health, upsert updates kind; created_at preserved). Frontend: eslint +
prettier clean; 81/81 vitest incl. 4 new (sign-out clears cached key via
fake-indexeddb, withCurrentMonth x3); tsc + build green. Sizes: production
sources <=200 (handler.go 140 with decodePut split, DashboardPage 142,
aggregation.ts 167, main.go 50); BA-DS-009 trimmed to 121 lines (15 rules
+ 8 examples kept; over the 90 limit under the WORK-002/003 spec
precedent 109/98 — further trimming drops approved rule content); test
files follow pre-existing sizes (App.test.tsx was 293).

### 4.2 Slice 2 gate evidence (2026-08-16, local ZCode/GLM-5.2)

Frontend only: eslint + prettier clean; 95/95 vitest incl. 14 new
(build/parse bundle x9 incl. no-plaintext + malformed refusals,
verifierMatches x2, restoreBundle flows x3: setup adopt+replay,
wrong-key no-write refusal, same-key merge replay); tsc + build green.
Backend untouched. Sizes: new modules domain/backup.ts 98, api/backup.ts
39, BackupCard 51, ImportCard 83; touched api/records.ts 122,
api/vault.ts 105, HelpPage 96, PassphraseSetupPage 137, useWorkspace
105, crypto/vault.ts 97 — all <=200. Design note: restore flow lives in
api/backup.ts (restoreBundle) so the flow is unit-testable without DOM
file-input flakiness; ImportCard is thin glue.

### 4.3 Slice 3 gate evidence (2026-08-16, local ZCode/GLM-5.2)

Backend: go build/vet/gofmt clean; 36/36 tests incl. 3 new (PUT /api/vault
overwrite + GET shows new envelope, repeatable no-409, unauth 401 leaves
vault unchanged). Frontend: eslint + prettier clean; 101/101 vitest incl.
6 new (policy x4; changePassphrase wrong-current no-write refusal + happy
path asserting envelope-PUT-last and per-record decrypt-ability under the
new key); tsc + build green. Sizes: api/passphrase.ts 69, domain/
passphrase.ts 15, PassphraseChangeCard 108, HelpPage 99, api/vault.ts
120, crypto/vault.ts 105, vault handler.go 138, store.go 58 — all <=200.
Design note: changePassphrase re-encrypts from the raw record list and
falls back to the new key per record, so a retry after a partial failure
re-encrypts mixed-key state safely (BR-PASS-3).

### 4.4 Integration result (2026-08-17)

Push approved (all 5 incl. WORK-003 S3). Two trunk repairs during deploy,
both root-caused: (1) 22b290d — CI prettier checks the whole frontend
tree, not just src/; dev-seed.mjs (463f67b) was never in that scope;
formatted. (2) 36728ef — the KDF-heavy changePassphrase tests (2-3 real
Argon2 derivations, m=64 MiB) exceeded vitest's 5s default under parallel
load; timeouts raised to 20s/30s, 3x green locally. Final deploy green at
36728ef. Operator-verified on production: /health 200 "ok" behind Caddy;
landing shows "~€5/mo VPS", no "£" in the deployed bundle (gzip required
--compressed when curling assets). Remaining: human account checks (§4
checklist) — export/import round trip, passphrase change on a test
account, sign-out re-asks passphrase, iPhone Safari.

## 5. Blockers and Deferred

None blocking. Deferred next packages (direction approved 2026-08-16,
one fresh session each): WORK-005 capture richness (merchant/payment/
tags fields, one-off income, edit UIs, recurring endedAt); WORK-006
budgets and insights; WORK-007 navigation and UX (URL routing, month
arrows, settings, gray.5 contrast sweep, close TICKET-001..015 statuses).
Pipeline housekeeping (human decision, not this package):
projects.yaml still points at the stale workspace copy; canonical repo
is C:\Users\asant\penny-saver. Offsite backups/Litestream stay excluded.

## 6. Completion

Delivered and verified 2026-08-17: signing out locks the space (BR-LOCK-1),
an encrypted bundle can be exported and restored with wrong-key refusal and
merge semantics (BR-EXP/IMP), the passphrase can be changed without data
loss with the envelope swapped last (BR-PASS), oversized uploads are
rejected (BR-HARD-1), /health answers (BR-HARD-2), record kind stays
current (BR-HARD-3), and the copy/selector quick wins shipped (BR-QW).
Verification: QA waived; human verified manually on production 2026-08-17
(all checks pass). Integration: eaf8b50 + repairs 22b290d, 36728ef; docs
7d2aede; CI/Deploy green. Remaining approved risk: none open; roadmap
WORK-005..007 recorded in §5. Supersedes nothing.
