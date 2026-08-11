/**
 * Fixed Phase-1 category taxonomy (TICKET-006, analysis-brief §5). Used by both
 * capture and recurring; user-defined categories are out of scope.
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
] as const

export type Category = (typeof CATEGORIES)[number]

/** Phase-1 display currency (BR-DQ-2, approved 2026-08-11: EUR). */
export const CURRENCY = 'EUR'
const CURRENCY_SYMBOL = '€'

/** Formats an amount in EUR for display. */
export function formatEUR(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}
