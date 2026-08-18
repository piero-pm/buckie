import type { Expense, Recurring } from './expense'
import { expandRecurring, monthlyExpenses, ym } from './aggregation'

/** Browser filters (BR-LST-1): a month, an optional category, optional free
 * text over note + category. Controls compose (month AND category AND text). */
export interface BrowserFilter {
  month: string
  category?: string
  query?: string
}

/** One month's rows for the Expenses browser: one-off + expanded recurring,
 * then category and text filters. Pure so tests pin the composition. */
export function browseExpenses(
  expenses: Expense[],
  recurring: Recurring[],
  filter: BrowserFilter
): Expense[] {
  const monthItems = monthlyExpenses(
    expenses,
    expandRecurring(recurring, filter.month),
    filter.month
  )
  return monthItems.filter((e) => matches(e, filter))
}

function matches(e: Expense, filter: BrowserFilter): boolean {
  if (filter.category && e.category !== filter.category) return false
  if (filter.query) {
    const q = filter.query.toLowerCase()
    const inNote = e.note?.toLowerCase().includes(q) ?? false
    if (!inNote && !e.category.toLowerCase().includes(q)) return false
  }
  return true
}

/** Month options for the browser: months with data plus the current one
 * (same reachability rule as the dashboard, BR-QW-2). */
export function browserMonths(
  expenses: Expense[],
  recurring: Recurring[],
  current: string
): string[] {
  const months = new Set<string>([current])
  for (const e of expenses) months.add(ym(e.date))
  for (const t of recurring) {
    const last = t.active ? current : (t.endedAt ?? ym(t.createdAt))
    let cursor = ym(t.createdAt)
    while (cursor <= last) {
      months.add(cursor)
      cursor = nextMonthKey(cursor)
    }
  }
  return [...months].sort().reverse()
}

function nextMonthKey(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
