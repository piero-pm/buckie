# TICKET-046: Editable expense note

Status: approved with WORK-006 direction 2026-08-18

| Field | Value |
| --- | --- |
| Behavior | Note editing (REQ-33, BR-EDIT-1 expense part) |
| Spec | [../delivery-spec-insights-capture.md](../delivery-spec-insights-capture.md) |
| Outcome | WORK-006 — insights + capture |
| Sequence | WORK-006 Slice 2 — after TICKET-044 |
| Depends on | TICKET-044 (browser rows reach the editor) |

## Intent

As a user I want to fix or add a note on an expense I already recorded,
so the browser search finds it later.

## Behavior

EditExpense gains an optional note field (same limits as capture-time
validation); saving persists it with the record. Lists and text search
reflect the change immediately.

## Acceptance

- Given an expense with a wrong note, editing and saving it updates
  lists and search results (EX-IC-5).

## Out of scope / notes

Capture page note field already exists; this is the edit-time symmetry.
