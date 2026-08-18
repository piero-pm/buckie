import type { IncomeSource } from './income'
import type { IncomeEvent } from './incomeEvent'
import { ym } from './aggregation'

/** Months between two yyyy-mm keys (b − a); positive when b is later. */
export function monthDiff(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number)
  const [by, bm] = b.split('-').map(Number)
  return (by - ay) * 12 + (bm - am)
}

/** Occurrences of a weekday (0=Sun..6=Sat) in a yyyy-mm. */
export function countWeekdays(month: string, weekday: number): number {
  const [y, m] = month.split('-').map(Number)
  const days = new Date(y, m, 0).getDate()
  let count = 0
  for (let d = 1; d <= days; d++) {
    if (new Date(y, m - 1, d).getDay() === weekday) count++
  }
  return count
}

/** Weekday (0=Sun..6=Sat) of a date-only string or full ISO timestamp. */
export function weekdayOf(date: string): number {
  const d = new Date(date.length === 10 ? date + 'T00:00:00' : date)
  return d.getDay()
}

/**
 * Amount a source contributes in a month (BR-INC-FREQ-1, gate 2026-08-18:
 * actual occurrences). Monthly pays every month; weekly pays per occurrence
 * of its weekday (default the creation weekday); quarterly/yearly pay every
 * third/twelfth month counting from the creation month. A source counts
 * from its creation month through its end month (BR-INC-3).
 */
export function sourceAmountInMonth(s: IncomeSource, month: string): number {
  const start = ym(s.createdAt)
  const end = s.active ? month : ym(s.endedAt ?? s.createdAt)
  if (month < start || month > end) return 0
  const freq = s.frequency ?? 'monthly'
  if (freq === 'monthly') return s.amount
  if (freq === 'weekly') {
    return (
      countWeekdays(month, s.payWeekday ?? weekdayOf(s.createdAt)) * s.amount
    )
  }
  const stride = freq === 'quarterly' ? 3 : 12
  return monthDiff(start, month) % stride === 0 ? s.amount : 0
}

/**
 * Total money in for a month: sources by occurrence plus one-off events
 * dated in the month (BR-IOFF-1).
 */
export function monthIncome(
  sources: IncomeSource[],
  month: string,
  events: IncomeEvent[] = []
): number {
  let total = 0
  for (const s of sources) total += sourceAmountInMonth(s, month)
  for (const ev of events) {
    if (ym(ev.date) === month) total += ev.amount
  }
  return total
}
