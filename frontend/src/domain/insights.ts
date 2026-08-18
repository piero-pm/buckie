import type { Expense, Recurring } from './expense'
import { expandRecurring, monthlyExpenses, monthRange, ym } from './aggregation'
import { BUCKETS, bucketFor } from './taxonomy'

/**
 * Daily spend totals (BR-HMAP-1): one-off + expanded recurring summed per
 * yyyy-mm-dd — the same aggregation as the lists. The Heatmap component
 * clips to its own trailing-year start/end dates, so no window logic here.
 */
export function dailyTotals(
  expenses: Expense[],
  recurring: Recurring[],
  throughMonth: string
): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const e of [...expenses, ...expandRecurring(recurring, throughMonth)]) {
    totals[e.date] = (totals[e.date] ?? 0) + e.amount
  }
  return totals
}

/**
 * Trend rows (BR-TRD-1): last `window` months ending at throughMonth; each
 * row is { month, [key]: total } with a key per bucket ("b:Fixed") and per
 * category ("Rent"). Legacy categories roll into their buckets (bucketFor).
 * Months without data read as zero, not gaps.
 */
export function categoryTrends(
  expenses: Expense[],
  recurring: Recurring[],
  throughMonth: string,
  window = 12
): Record<string, number | string>[] {
  const expanded = expandRecurring(recurring, throughMonth)
  const months = trailingMonths(expenses, expanded, throughMonth, window)
  return months.map((month) => {
    const row: Record<string, number | string> = { month }
    for (const e of monthlyExpenses(expenses, expanded, month)) {
      const bucket = `b:${bucketFor(e.category)}`
      row[bucket] = ((row[bucket] as number) ?? 0) + e.amount
      row[e.category] = ((row[e.category] as number) ?? 0) + e.amount
    }
    for (const b of BUCKETS) if (!(`b:${b}` in row)) row[`b:${b}`] = 0
    return row
  })
}

function trailingMonths(
  expenses: Expense[],
  expanded: Expense[],
  throughMonth: string,
  window: number
): string[] {
  const dataMonths = [...expenses, ...expanded].map((e) => ym(e.date))
  const span = monthRange(
    dataMonths.map((month) => ({ month })),
    throughMonth
  )
  return span.slice(-window)
}
