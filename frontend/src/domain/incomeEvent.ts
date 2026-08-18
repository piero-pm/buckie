import type { ValidationResult } from './expense'

/** One-off income event kinds (BR-IOFF-1, gate 2026-08-18: typed). */
export const EVENT_KINDS = ['bonus', 'gift', 'refund', 'other'] as const
export type EventKind = (typeof EVENT_KINDS)[number]

export const EVENT_LABELS: Record<EventKind, string> = {
  bonus: 'Bonus',
  gift: 'Gift',
  refund: 'Refund',
  other: 'Other',
}

/**
 * A one-off money-in event (TICKET-042): bonus, gift, or refund. Not a
 * source — it counts once, in the month of its date. Encrypted client-side
 * like every record; the server stores only ciphertext.
 */
export interface IncomeEvent {
  id: string
  amount: number
  date: string // yyyy-mm-dd
  eventKind: EventKind
  note?: string
  createdAt: string // ISO timestamp
}

export interface IncomeEventInput {
  amount: number
  date: string
  eventKind: string
  note?: string
}

const MAX_AMOUNT = 1_000_000
const MAX_DECIMALS = /^-?\d+(\.\d{1,2})?$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const MAX_NOTE = 80

/** Validates an event against BR-IOFF-1 (amount mirrors BR-DQ). */
export function validateIncomeEvent(input: IncomeEventInput): ValidationResult {
  return (
    validateEventKind(input.eventKind) ??
    validateAmount(input.amount) ??
    validateDate(input.date) ??
    validateNote(input.note) ?? { ok: true }
  )
}

function validateEventKind(kind: string): ValidationResult | null {
  if (!(EVENT_KINDS as readonly string[]).includes(kind)) {
    return { ok: false, field: 'kind', error: 'Choose an event kind.' }
  }
  return null
}

function validateAmount(amount: number): ValidationResult | null {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      field: 'amount',
      error: 'Amount must be greater than 0.',
    }
  }
  if (!MAX_DECIMALS.test(String(amount))) {
    return {
      ok: false,
      field: 'amount',
      error: 'Amount may have at most two decimal places.',
    }
  }
  if (amount > MAX_AMOUNT) {
    return {
      ok: false,
      field: 'amount',
      error: `Amount must be at most ${MAX_AMOUNT}.`,
    }
  }
  return null
}

function validateDate(date: string): ValidationResult | null {
  if (!ISO_DATE.test(date)) {
    return { ok: false, field: 'date', error: 'Enter a valid date.' }
  }
  return null
}

function validateNote(note?: string): ValidationResult | null {
  if (note && note.length > MAX_NOTE) {
    return {
      ok: false,
      field: 'label',
      error: 'Note may be at most 80 characters.',
    }
  }
  return null
}
