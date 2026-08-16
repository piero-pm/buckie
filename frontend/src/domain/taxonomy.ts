/**
 * Fixed category taxonomy (BR-TAX-1, WORK-003): 14 general everyday
 * categories — a superset of the Phase-1 eight, so existing records stay
 * valid with no migration ("not a bank": general spending, not bank-grade
 * detail). Used by capture and recurring; user-defined categories remain
 * out of scope.
 */
export const CATEGORIES = [
  'Rent',
  'Bills',
  'Food',
  'Transport & Travel',
  'Gift',
  'Health',
  'Shopping',
  'Miscellaneous',
  'Entertainment & Subscriptions',
  'Personal care',
  'Education & Books',
  'Pets',
  'Family & Kids',
  'Insurance',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Phase-1 display currency (BR-DQ-2, approved 2026-08-11: EUR). */
export const CURRENCY = 'EUR'
const CURRENCY_SYMBOL = '€'

/** Formats an amount in EUR for display. */
export function formatEUR(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}
