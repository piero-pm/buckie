import { EXPECTATIONS_ID } from './ids'

/**
 * The user's plan (BR-EXP-SET-1, WORK-005): a one-off starting bank balance
 * plus expected monthly amounts for six buckets — rent, bills, groceries,
 * going out, shopping, subscriptions. All manual (never derived from
 * recurring). Stored as one encrypted record with a fixed id.
 */
export interface ExpectedAmounts {
  rent?: number
  bills?: number
  groceries?: number
  goingOut?: number
  shopping?: number
  subscriptions?: number
}

export interface Expectations {
  id: string // always EXPECTATIONS_ID
  startingBalance: number
  expected: ExpectedAmounts
  updatedAt: string // ISO timestamp
}

export const EXPECTED_FIELDS: (keyof ExpectedAmounts)[] = [
  'rent',
  'bills',
  'groceries',
  'goingOut',
  'shopping',
  'subscriptions',
]

/** Labels for the six buckets, shared by forms and comparisons. */
export const EXPECTED_LABELS: Record<keyof ExpectedAmounts, string> = {
  rent: 'Rent',
  bills: 'Bills',
  groceries: 'Groceries',
  goingOut: 'Going out',
  shopping: 'Shopping',
  subscriptions: 'Subscriptions',
}

const MAX = 1_000_000
const TWO_DECIMALS = /^-?\d+(\.\d{1,2})?$/

/** Validates BR-EXP-SET-1: a finite balance and positive optional expected
 * amounts, at most two decimals. Returns the first problem, or null. */
export function validateExpectations(input: {
  startingBalance: number
  expected: ExpectedAmounts
}): string | null {
  if (
    !Number.isFinite(input.startingBalance) ||
    !TWO_DECIMALS.test(String(input.startingBalance)) ||
    Math.abs(input.startingBalance) > MAX
  ) {
    return 'Starting balance is required (at most two decimals).'
  }
  for (const key of EXPECTED_FIELDS) {
    const v = input.expected[key]
    if (v === undefined) continue
    if (
      !Number.isFinite(v) ||
      v <= 0 ||
      !TWO_DECIMALS.test(String(v)) ||
      v > MAX
    ) {
      return `${EXPECTED_LABELS[key]} must be a positive amount with at most two decimals.`
    }
  }
  return null
}

/** Builds the storable record from raw form values. */
export function toExpectations(
  startingBalance: number,
  expected: ExpectedAmounts
): Expectations {
  const clean: ExpectedAmounts = {}
  for (const key of EXPECTED_FIELDS) {
    const v = expected[key]
    if (v !== undefined && Number.isFinite(v) && v > 0) clean[key] = v
  }
  return {
    id: EXPECTATIONS_ID,
    startingBalance,
    expected: clean,
    updatedAt: new Date().toISOString(),
  }
}
