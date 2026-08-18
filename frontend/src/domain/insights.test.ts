import { describe, it, expect } from 'vitest'
import { categoryTrends, dailyTotals } from './insights'
import type { Expense, Recurring } from './expense'

const exp = (
  id: string,
  date: string,
  amount: number,
  category: Expense['category']
): Expense => ({ id, amount, category, date, createdAt: date })

const template: Recurring = {
  id: 'gym',
  amount: 40,
  category: 'Subscriptions',
  dayOfMonth: 5,
  active: true,
  createdAt: '2025-11-01',
}

describe('dailyTotals (BR-HMAP-1, TICKET-047)', () => {
  it('sums one-off and recurring per day', () => {
    const totals = dailyTotals(
      [
        exp('a', '2026-08-01', 10, 'Groceries'),
        exp('b', '2026-08-01', 5, 'Rent'),
      ],
      [template],
      '2026-08'
    )
    expect(totals['2026-08-01']).toBe(15)
    expect(totals['2026-08-05']).toBe(40) // recurring on its day
  })

  it('is empty with no data', () => {
    expect(dailyTotals([], [], '2026-08')).toEqual({})
  })
})

describe('categoryTrends (BR-TRD-1, TICKET-048)', () => {
  it('rolls up buckets and keeps per-category keys, zero months included', () => {
    const rows = categoryTrends(
      [
        exp('a', '2026-07-01', 100, 'Groceries'),
        exp('b', '2026-08-01', 50, 'Rent'),
      ],
      [],
      '2026-08'
    )
    const july = rows.find((r) => r.month === '2026-08')!
    // Buckets always present, zero when the month has none of them.
    expect(july['b:Everyday']).toBe(0)
    expect(july['b:Fixed']).toBe(50)
    expect(july['Rent']).toBe(50)
  })

  it('maps legacy categories into buckets (Food -> Everyday)', () => {
    const rows = categoryTrends(
      [exp('old', '2026-08-02', 20, 'Food' as Expense['category'])],
      [],
      '2026-08'
    )
    expect(rows[rows.length - 1]['b:Everyday']).toBe(20)
  })

  it('windows to the last 12 months ending at throughMonth', () => {
    const rows = categoryTrends(
      [
        exp('old', '2024-01-01', 20, 'Rent'),
        exp('new', '2026-08-01', 10, 'Rent'),
      ],
      [],
      '2026-08'
    )
    expect(rows).toHaveLength(12)
    expect(rows[0]['month']).toBe('2025-09')
    expect(rows.map((r) => r.month)).toContain('2026-08')
    expect(rows.map((r) => r.month)).not.toContain('2024-01')
  })
})
