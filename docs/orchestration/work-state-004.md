# Work State: Data Safety — Backup, Passphrase Change, Lock on Sign-Out

| Field | Value |
| --- | --- |
| ID | WORK-004 |
| Status | Running — Business Analyst |
| Active project | buckie |
| Request class | Increment to live product |
| Current stage | Business Analyst |
| Next owner | Human (BA material-rule gate) |
| Updated | 2026-08-16 |

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
| Slice pushes (production deploy) | Human | Pending | Per-slice gates in §4 |

## 3. Stage Ledger

| Stage | Status | Input | Output or verdict | Next condition |
| --- | --- | --- | --- | --- |
| Product Owner | Passed | Direct user intake + review findings | Scope §1 | BA elaborates |
| Business Analyst | Passed | BA-DS-001/007 + review evidence | BA-DS-009 approved; traceability updated | Lead direction |
| UX Designer | Excluded | n/a | Waived: UX inline (WORK-001) | n/a |
| Lead Developer | Passed | Approved BA-DS-009 | 3-slice direction + TICKET-030..035 approved | Developer starts S1 |
| Developer | Running | Tickets 030-035 | Slices per §4 | Push approval + human verification |
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

Delivered when slices are pushed and verified: signing out locks the
space, an encrypted bundle can be exported and restored, the passphrase
can be changed without data loss, oversized uploads are rejected, and
/health answers. QA waived -> human verifies manually; integration via
the slice commits approved in §2.
