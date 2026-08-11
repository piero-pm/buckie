import { useMemo, useState } from 'react'
import type { Expense, Recurring } from '../domain/expense'
import {
  expandRecurring,
  monthlyExpenses,
  monthTotal,
  byCategory,
  projectSavings,
  ym,
} from '../domain/aggregation'
import { formatEUR } from '../domain/taxonomy'

interface Props {
  expenses: Expense[]
  recurring: Recurring[]
  onBack: () => void
}

const currentMonth = () => ym(new Date())

/** Month-on-month totals, spend-by-category, and a savings projection
 * (TICKET-013/014/015). All aggregation runs client-side over decrypted
 * records; the server only ever saw ciphertext. */
export default function DashboardPage({ expenses, recurring, onBack }: Props) {
  const [selected, setSelected] = useState(currentMonth())

  const months = useMemo(() => {
    const expanded = expandRecurring(recurring, currentMonth())
    const all = [...expenses, ...expanded]
    const totals = new Map<string, number>()
    for (const e of all) {
      const m = ym(e.date)
      totals.set(m, (totals.get(m) ?? 0) + e.amount)
    }
    return [...totals.entries()]
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month < b.month ? -1 : 1))
  }, [expenses, recurring])

  const expandedForSelected = useMemo(
    () => expandRecurring(recurring, selected),
    [recurring, selected]
  )
  const monthItems = useMemo(
    () => monthlyExpenses(expenses, expandedForSelected, selected),
    [expenses, expandedForSelected, selected]
  )
  const total = monthTotal(monthItems)
  const breakdown = byCategory(monthItems).filter((c) => c.total > 0)
  const projection = useMemo(() => projectSavings(months), [months])

  return (
    <main aria-label="dashboard">
      <h1>Dashboard</h1>

      <label htmlFor="month">Month</label>
      <select
        id="month"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        {[...months].reverse().map((m) => (
          <option key={m.month} value={m.month}>
            {m.month}
          </option>
        ))}
      </select>

      <h2>Total this month</h2>
      <p aria-label="month total">{formatEUR(total)}</p>

      <h2>By category</h2>
      <ul>
        {breakdown.map((c) => (
          <li key={c.category}>
            {c.category}: {formatEUR(c.total)}
          </li>
        ))}
        {breakdown.length === 0 && <li>No spend recorded.</li>}
      </ul>

      <h2>Month-on-month</h2>
      <ul>
        {[...months].reverse().map((m) => (
          <li key={m.month}>
            {m.month}: {formatEUR(m.total)}
          </li>
        ))}
      </ul>

      <h2>Savings projection</h2>
      {projection.hasData ? (
        <p aria-label="projection">
          Estimate (labelled): next month ~
          {formatEUR(projection.nextMonthEstimate ?? 0)}; at this rate ~
          {formatEUR(projection.yearlyIfContinued ?? 0)} over 12 months.{' '}
          {projection.basis}
        </p>
      ) : (
        <p aria-label="projection">{projection.basis}</p>
      )}

      <button onClick={onBack}>Back</button>
    </main>
  )
}
