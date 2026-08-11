import { CATEGORIES, type Category } from './taxonomy'

/**
 * A single one-off expense (TICKET-005). Amount/category/date are domain fields;
 * the record is encrypted client-side before reaching the server. `id` is a
 * client-generated UUID; `createdAt` orders the recent list.
 */
export interface Expense {
  id: string
  amount: number
  category: Category
  date: string // ISO yyyy-mm-dd
  note?: string
  createdAt: string // ISO timestamp
}

/** Recurring monthly template (TICKET-010). dayOfMonth applies each month. */
export interface Recurring {
  id: string
  amount: number
  category: Category
  dayOfMonth: number // 1..31; clamped to month's last day (EX-REC-2)
  note?: string
  active: boolean
  createdAt: string
}

const MAX_AMOUNT = 1_000_000 // approved sane maximum
const MAX_DECIMALS = /^-?\d+(\.\d{1,2})?$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string; field?: 'amount' | 'category' | 'date' }

/** Validates an expense against BR-DQ-1..4. Returns the first failure, if any. */
export function validateExpense(input: {
  amount: number
  category: string
  date: string
}): ValidationResult {
  return (
    validateAmount(input.amount) ??
    validateCategory(input.category) ??
    validateDate(input.date) ?? { ok: true }
  )
}

function validateAmount(amount: number): ValidationResult | null {
  if (!Number.isFinite(amount)) {
    return { ok: false, field: 'amount', error: 'Amount is required.' }
  }
  if (amount <= 0) {
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

function validateCategory(category: string): ValidationResult | null {
  if (!category) {
    return { ok: false, field: 'category', error: 'Category is required.' }
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return {
      ok: false,
      field: 'category',
      error: 'Category must be from the list.',
    }
  }
  return null
}

function validateDate(date: string): ValidationResult | null {
  if (!date || !ISO_DATE.test(date)) {
    return { ok: false, field: 'date', error: 'Date is required.' }
  }
  const today = new Date()
  const entered = new Date(date + 'T00:00:00')
  if (entered > today) {
    return { ok: false, field: 'date', error: 'Date cannot be in the future.' }
  }
  return null
}

/** Validates a recurring template (BR-DQ-1/4 for amount/category + day range). */
export function validateRecurring(input: {
  amount: number
  category: string
  dayOfMonth: number
}): ValidationResult {
  const amount = validateAmount(input.amount)
  if (amount) return amount
  const category = validateCategory(input.category)
  if (category) return category
  if (
    !Number.isInteger(input.dayOfMonth) ||
    input.dayOfMonth < 1 ||
    input.dayOfMonth > 31
  ) {
    return {
      ok: false,
      field: 'date',
      error: 'Day of month must be between 1 and 31.',
    }
  }
  return { ok: true }
}
