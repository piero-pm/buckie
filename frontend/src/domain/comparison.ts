import type { Expense } from './expense'
import {
  EXPECTED_FIELDS,
  EXPECTED_LABELS,
  type ExpectedAmounts,
} from './expectations'

/** Categories counted inside each expected bucket. Legacy values are
 * approximated to their closest bucket (BR-TAX-3): "Food" leans groceries,
 * "Entertainment & Subscriptions" leans going out. */
const BUCKET_CATEGORIES: Record<keyof ExpectedAmounts, string[]> = {
  rent: ['Rent'],
  bills: ['Bills'],
  groceries: ['Groceries', 'Food'],
  goingOut: [
    'Restaurants & drinks',
    'Entertainment & culture',
    'Entertainment & Subscriptions',
  ],
  shopping: ['Shopping & clothes', 'Shopping'],
  subscriptions: ['Subscriptions'],
}

export interface BucketCompare {
  key: keyof ExpectedAmounts
  label: string
  expected?: number
  actual: number
  /** null when no expectation is set (actual-only row). */
  over: boolean | null
  /** actual − expected; positive means over. null when no expectation. */
  delta: number | null
}

/** Compares a month's items (one-off + expanded recurring) against the
 * expected amounts (BR-CMP-1). */
export function compareBuckets(
  monthItems: Expense[],
  expected: ExpectedAmounts
): BucketCompare[] {
  return EXPECTED_FIELDS.map((key) => {
    const cats = new Set(BUCKET_CATEGORIES[key])
    const actual = round(
      monthItems
        .filter((e) => cats.has(e.category))
        .reduce((s, e) => s + e.amount, 0)
    )
    const exp = expected[key]
    if (exp === undefined) {
      return {
        key,
        label: EXPECTED_LABELS[key],
        actual,
        over: null,
        delta: null,
      }
    }
    const delta = round(actual - exp)
    return {
      key,
      label: EXPECTED_LABELS[key],
      expected: exp,
      actual,
      over: actual > exp,
      delta,
    }
  })
}

/** The green saved bar (BR-DASH-2): income − spend, clamped at zero with the
 * over-spend surfaced separately for the red callout. */
export function savedThisMonth(
  income: number,
  spend: number
): { saved: number; overspent: number } {
  const net = round(income - spend)
  return net >= 0 ? { saved: net, overspent: 0 } : { saved: 0, overspent: -net }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
