import type { Expense, Recurring } from './expense'
import { CATEGORIES, LEGACY_CATEGORIES, type Category } from './taxonomy'

/** ym returns the yyyy-mm key for a date string or Date. Accepts date-only
 * strings (parsed as local midnight) and full ISO timestamps. */
export function ym(date: string | Date): string {
  const d =
    typeof date === 'string'
      ? new Date(date.length === 10 ? date + 'T00:00:00' : date)
      : date
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Month list for selectors: data months plus the current one even when it
 * has no data yet (BR-QW-2 — an empty current month stays reachable). */
export function withCurrentMonth(months: string[], current: string): string[] {
  return months.includes(current) ? months : [...months, current]
}

/**
 * Expands active recurring templates into synthetic expenses for every month
 * from each template's creation month through the current month (TICKET-011).
 * dayOfMonth is clamped to each month's last day (EX-REC-2). Recurring amounts
 * are combined with one-off expenses when a month is totalled.
 */
export function expandRecurring(
  templates: Recurring[],
  throughMonth: string
): Expense[] {
  const out: Expense[] = []
  for (const t of templates) {
    if (!t.active) continue
    let cursor = ym(t.createdAt)
    while (cursor <= throughMonth) {
      out.push({
        id: `${t.id}:${cursor}`,
        amount: t.amount,
        category: t.category,
        date: resolveDay(cursor, t.dayOfMonth),
        note: t.note,
        createdAt: `${cursor}-01`,
      })
      cursor = nextMonth(cursor)
    }
  }
  return out
}

/** Combines one-off expenses with expanded recurring items for a month. */
export function monthlyExpenses(
  expenses: Expense[],
  recurring: Expense[],
  month: string
): Expense[] {
  return [...expenses, ...recurring].filter((e) => ym(e.date) === month)
}

/** Sums a list of expenses to a month total. */
export function monthTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

/** Breaks a month's spend down by category; sums equal the month total.
 * Legacy stored categories appear only when actually used (BR-TAX-3). */
export function byCategory(
  expenses: Expense[]
): { category: string; total: number }[] {
  const totals = new Map<string, number>()
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  const legacyUsed = LEGACY_CATEGORIES.filter((c) => totals.has(c))
  return [...CATEGORIES, ...legacyUsed].map((category) => ({
    category,
    total: totals.get(category) ?? 0,
  }))
}

/**
 * Savings projection (TICKET-015): forward estimate from the trend. With >= 3
 * months of history, projects next month as the average monthly total and a
 * 12-month cumulative saving at that rate (income-dependent decisions excluded).
 * With < 3 months, returns insufficient-data so the UI says so (EX-DASH-5).
 */
export interface Projection {
  hasData: boolean
  basis: string
  nextMonthEstimate?: number
  yearlyIfContinued?: number
}

export function projectSavings(
  monthlyTotals: { month: string; total: number }[]
): Projection {
  if (monthlyTotals.length < 3) {
    return {
      hasData: false,
      basis: 'Need at least 3 months of history to project.',
    }
  }
  const avg =
    monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length
  return {
    hasData: true,
    basis: `Average monthly spend over the last ${monthlyTotals.length} months.`,
    nextMonthEstimate: avg,
    yearlyIfContinued: avg * 12,
  }
}

/** Returns the yyyy-mm keys spanning from the first to current month. */
export function monthRange(
  monthlyTotals: { month: string }[],
  current: string
): string[] {
  if (monthlyTotals.length === 0) return [current]
  const sorted = monthlyTotals.map((m) => m.month).sort()
  const months: string[] = []
  let cursor = sorted[0]
  while (cursor <= current) {
    months.push(cursor)
    cursor = nextMonth(cursor)
  }
  return months
}

/** BR-CAP-1 quick picks: the user's most-used categories first (by record
 * count), filled up to `limit` from the fixed taxonomy in fixed order. */
export function topCategories(expenses: Expense[], limit = 6): Category[] {
  const counts = new Map<Category, number>()
  for (const e of expenses) {
    counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
  }
  const used = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
  const rest = CATEGORIES.filter((c) => !used.includes(c))
  return [...used, ...rest].slice(0, limit)
}

function resolveDay(month: string, dayOfMonth: number): string {
  const [y, m] = month.split('-').map(Number)
  const lastDay = new Date(y, m, 0).getDate() // day 0 of next month = last of this
  return `${month}-${String(Math.min(dayOfMonth, lastDay)).padStart(2, '0')}`
}

/** Returns the yyyy-mm key of the month after `month`. */
export function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1) // m is 0-indexed; m = next month
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
