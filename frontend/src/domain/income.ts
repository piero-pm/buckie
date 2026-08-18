import type { ValidationResult } from './expense'

/** Income source kinds (BR-INC-1 + BR-INC-4, WORK-003: general set;
 * savings kept for existing records). */
export const INCOME_KINDS = [
  'salary',
  'freelance',
  'savings',
  'investment',
  'other',
] as const
export type IncomeKind = (typeof INCOME_KINDS)[number]

export const INCOME_LABELS: Record<IncomeKind, string> = {
  salary: 'Salary',
  freelance: 'Freelance & side income',
  savings: 'Savings',
  investment: 'Investments (stocks)',
  other: 'Other income',
}

/** Pay frequencies (BR-INC-FREQ-1, gate 2026-08-18: actual occurrences). */
export const FREQUENCIES = ['monthly', 'weekly', 'quarterly', 'yearly'] as const
export type Frequency = (typeof FREQUENCIES)[number]

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}

/** Weekday labels for weekly paydays (index = Date.getDay(), 0=Sunday). */
export const WEEKDAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

/**
 * A recurring monthly income source (TICKET-020): salary, savings
 * contribution, or stock investment. `amount` is the monthly figure.
 * Investment sources are structured so a provider/symbol can attach later
 * (API balance sync is future work, work-state-002 §2). Encrypted client-side
 * like every record; the server stores only ciphertext.
 */
export interface IncomeSource {
  id: string
  amount: number
  kind: IncomeKind
  label?: string
  dayOfMonth?: number // 1..31; clamped to month's last day (BR-INC-2)
  /** Pay frequency; missing = monthly (existing records unchanged). */
  frequency?: Frequency
  /** Weekly payday, 0=Sun..6=Sat; defaults to the creation weekday. */
  payWeekday?: number
  active: boolean
  /** Set when ended: months before it are preserved, after excluded. */
  endedAt?: string
  createdAt: string
}

export interface IncomeInput {
  amount: number
  kind: string
  label?: string
  dayOfMonth?: number
  frequency?: string
  payWeekday?: number
}

const MAX_AMOUNT = 1_000_000
const MAX_DECIMALS = /^-?\d+(\.\d{1,2})?$/
const MAX_LABEL = 40

/** Validates an income source against BR-INC-1/2 + frequency fields. */
export function validateIncomeSource(input: IncomeInput): ValidationResult {
  return (
    validateKind(input.kind) ??
    validateAmount(input.amount) ??
    validateLabel(input.label) ??
    validateDay(input.dayOfMonth) ??
    validateFrequency(input.frequency) ??
    validateWeekday(input.payWeekday) ?? { ok: true }
  )
}

function validateKind(kind: string): ValidationResult | null {
  if (!(INCOME_KINDS as readonly string[]).includes(kind)) {
    return {
      ok: false,
      field: 'kind',
      error: 'Choose an income kind.',
    }
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

function validateLabel(label?: string): ValidationResult | null {
  if (label && label.length > MAX_LABEL) {
    return {
      ok: false,
      field: 'label',
      error: 'Label may be at most 40 characters.',
    }
  }
  return null
}

function validateDay(day?: number): ValidationResult | null {
  if (day === undefined) return null
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return {
      ok: false,
      field: 'dayOfMonth',
      error: 'Day of month must be between 1 and 31.',
    }
  }
  return null
}

function validateFrequency(frequency?: string): ValidationResult | null {
  if (frequency === undefined) return null
  if (!(FREQUENCIES as readonly string[]).includes(frequency)) {
    return { ok: false, field: 'kind', error: 'Choose a frequency.' }
  }
  return null
}

function validateWeekday(weekday?: number): ValidationResult | null {
  if (weekday === undefined) return null
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    return {
      ok: false,
      field: 'dayOfMonth',
      error: 'Payday must be a weekday.',
    }
  }
  return null
}
