import { describe, it, expect } from 'vitest'
import {
  expandRecurring,
  monthlyExpenses,
  monthTotal,
  byCategory,
  projectSavings,
  ym,
} from './aggregation'
import type { Expense, Recurring } from './expense'

const expense = (
  id: string,
  amount: number,
  category: Expense['category'],
  date: string
): Expense => ({ id, amount, category, date, createdAt: date })

describe('recurring expansion (TICKET-010/011)', () => {
  const template: Recurring = {
    id: 'rent',
    amount: 800,
    category: 'Rent',
    dayOfMonth: 1,
    active: true,
    createdAt: '2026-01-01',
  }

  it('expands an active template once per month from creation through now', () => {
    const expanded = expandRecurring([template], '2026-03')
    expect(expanded).toHaveLength(3) // Jan, Feb, Mar
    expect(expanded.map((e) => ym(e.date))).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
    ])
    expect(expanded[0].amount).toBe(800)
  })

  // EX-REC-2: day 31 clamps to the last day of shorter months.
  it('clamps day 31 to the last day of shorter months (EX-REC-2)', () => {
    const t31: Recurring = {
      ...template,
      dayOfMonth: 31,
      createdAt: '2026-01-31',
    }
    const expanded = expandRecurring([t31], '2026-03')
    expect(expanded[0].date).toBe('2026-01-31') // Jan has 31
    expect(expanded[1].date).toBe('2026-02-28') // Feb clamps to 28
    expect(expanded[2].date).toBe('2026-03-31') // Mar has 31
  })

  it('skips inactive templates', () => {
    const inactive: Recurring = { ...template, active: false }
    expect(expandRecurring([inactive], '2026-03')).toHaveLength(0)
  })
})

describe('monthly totals (TICKET-013)', () => {
  const expenses = [
    expense('1', 50, 'Food', '2026-08-01'),
    expense('2', 30, 'Food', '2026-08-15'),
    expense('3', 100, 'Rent', '2026-07-01'),
  ]

  it('combines one-off + recurring in a month', () => {
    const recurring = expandRecurring(
      [
        {
          id: 'r',
          amount: 800,
          category: 'Rent',
          dayOfMonth: 1,
          active: true,
          createdAt: '2026-08-01',
        },
      ],
      '2026-08'
    )
    const month = monthlyExpenses(expenses, recurring, '2026-08')
    expect(monthTotal(month)).toBe(50 + 30 + 800)
  })

  it('excludes other months', () => {
    expect(monthTotal(monthlyExpenses(expenses, [], '2026-07'))).toBe(100)
  })
})

describe('category breakdown (TICKET-014)', () => {
  it('sums by category and totals equal the month total', () => {
    const expenses = [
      expense('1', 50, 'Food', '2026-08-01'),
      expense('2', 30, 'Food', '2026-08-02'),
      expense('3', 100, 'Rent', '2026-08-03'),
    ]
    const breakdown = byCategory(expenses)
    const food = breakdown.find((c) => c.category === 'Food')
    const rent = breakdown.find((c) => c.category === 'Rent')
    expect(food?.total).toBe(80)
    expect(rent?.total).toBe(100)
    // Category totals sum to the month total (TICKET-014 acceptance).
    expect(breakdown.reduce((s, c) => s + c.total, 0)).toBe(
      monthTotal(expenses)
    )
  })

  it('shows zero for categories with no spend', () => {
    const breakdown = byCategory([expense('1', 50, 'Food', '2026-08-01')])
    expect(breakdown.find((c) => c.category === 'Gift')?.total).toBe(0)
  })
})

describe('savings projection (TICKET-015)', () => {
  it('indicates insufficient data with < 3 months (EX-DASH-5)', () => {
    const p = projectSavings([{ month: '2026-07', total: 100 }])
    expect(p.hasData).toBe(false)
  })

  it('projects an average from >= 3 months with basis stated (EX-DASH-4)', () => {
    const p = projectSavings([
      { month: '2026-05', total: 900 },
      { month: '2026-06', total: 1100 },
      { month: '2026-07', total: 1000 },
    ])
    expect(p.hasData).toBe(true)
    expect(p.nextMonthEstimate).toBe(1000)
    expect(p.yearlyIfContinued).toBe(12000)
    expect(p.basis).toContain('Average')
  })
})
