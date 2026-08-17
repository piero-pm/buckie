import type { Expense, Recurring } from './expense'
import type { IncomeSource } from './income'
import { expandRecurring, monthIncome, nextMonth, ym } from './aggregation'

export interface MonthlyFigure {
  month: string
  spend: number
  income: number
  net: number
}

/** Every month that has spend or income, ascending: spend = one-off +
 * expanded recurring, income = monthIncome, net = income − spend. */
export function monthlyFigures(
  expenses: Expense[],
  recurring: Recurring[],
  incomes: IncomeSource[],
  throughMonth: string
): MonthlyFigure[] {
  const expanded = expandRecurring(recurring, throughMonth)
  const spend = new Map<string, number>()
  for (const e of [...expenses, ...expanded]) {
    const m = ym(e.date)
    spend.set(m, (spend.get(m) ?? 0) + e.amount)
  }
  const months = new Set(spend.keys())
  for (const s of incomes) {
    let cursor = ym(s.createdAt)
    const end = s.active ? throughMonth : ym(s.endedAt ?? s.createdAt)
    while (cursor <= end) {
      months.add(cursor)
      cursor = nextMonth(cursor)
    }
  }
  return [...months].sort().map((month) => {
    const income = monthIncome(incomes, month)
    const sp = spend.get(month) ?? 0
    return { month, spend: sp, income, net: income - sp }
  })
}

/** Average spend and saving over the last `window` months of the series
 * (BR-PRJ-2; income-aware — resolves TICKET-015). */
export function windowAverages(
  figures: MonthlyFigure[],
  window: number
): { avgSpend: number; avgSaving: number; months: number } {
  const slice = figures.slice(-window)
  const n = slice.length
  if (n === 0) return { avgSpend: 0, avgSaving: 0, months: 0 }
  const spend = slice.reduce((s, f) => s + f.spend, 0) / n
  const saving = slice.reduce((s, f) => s + f.net, 0) / n
  return { avgSpend: spend, avgSaving: saving, months: n }
}

/** Running net balance over the series (BR-PRJ-2 chart line). With a
 * starting balance (BR-PRJ-2, WORK-005) the line anchors there; without one
 * it starts from zero as before. */
export function cumulativeNet(
  figures: MonthlyFigure[],
  startingBalance = 0
): {
  month: string
  balance: number
}[] {
  let balance = startingBalance
  return figures.map((f) => {
    balance += f.net
    return { month: f.month, balance }
  })
}

/** BR-PRJ-1 benchmark: average spend over the up-to-3 months before
 * `selected`; null when no prior month exists. */
export function expectedSpend(
  figures: MonthlyFigure[],
  selected: string,
  lookback = 3
): number | null {
  const prior = figures.filter((f) => f.month < selected).slice(-lookback)
  if (prior.length === 0) return null
  return prior.reduce((s, f) => s + f.spend, 0) / prior.length
}
