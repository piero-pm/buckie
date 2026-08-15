# TICKET-020: Income source register

Status: approved with WORK-002 plan 2026-08-16

| Field | Value |
| --- | --- |
| Behavior | Income sources (REQ-20, BR-INC-1..3) |
| Spec | [../delivery-spec-income.md](../delivery-spec-income.md) |
| Outcome | WORK-002 — complete monthly picture |
| Sequence | WORK-002 Slice 3 — after TICKET-019 |
| Depends on | TICKET-018 (header), Epic A recurring patterns |

## Intent

As the owner I want to record where money comes from — salary, savings
contributions, stock investments — as monthly sources I can edit anytime, so
Buckie shows my full monthly picture and is ready for future investment
tracking.

## Behavior

A signed-in unlocked user manages income sources in an Income section:
add (kind, monthly amount, optional label, optional day-of-month), edit, and
end (two-step end/delete, mirroring recurring). Sources expand into each
month automatically until ended. Records travel the existing encrypted
channel — the server gains only a new kind value, never plaintext. The kind
set is fixed: salary, savings, investment.

## Acceptance

- Given a valid source (kind + amount within BR-INC-2 limits), when saved,
  then it is stored encrypted and counts toward the current and later months
  (EX-INC-1).
- Given an invalid amount (0, negative, > 2 decimals, > 1,000,000), when
  saved, then it is refused with a clear reason (EX-INC-2).
- Given a short month, when day-of-month exceeds it, then the month's last
  day is used (mirrors EX-REC-2).
- Given an active source, when ended, then future months exclude it and past
  months are unchanged (EX-INC-3).
- Given any later session, when the user opens Income, then sources can be
  added, edited, or ended anytime (EX-INC-4).
- Given the server, when income is stored, then it sees only ciphertext under
  the income kind (BR-CONF-1 holds).

## Out of scope / notes

Investment balance API sync is future work (work-state-002 §2); sources carry
a monthly figure now and a structure that can attach provider/symbol later.
No payslip variability, no taxes, no multi-currency. Backend change is one
kind whitelist entry — no migration.
