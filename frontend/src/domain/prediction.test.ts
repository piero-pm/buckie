import { describe, it, expect } from 'vitest'
import {
  cumulativeNet,
  expectedSpend,
  monthFunnel,
  monthlyFigures,
  windowAverages,
} from './prediction'
import type { Expense, Recurring } from './expense'
import type { IncomeSource } from './income'

const spend = (
  id: string,
  amount: number,
  category: Expense['category'],
  date: string
): Expense => ({ id, amount, category, date, createdAt: date })

const salary = (amount: number, from: string): IncomeSource => ({
  id: 'sal',
  amount,
  kind: 'salary',
  active: true,
  createdAt: from,
})

describe('monthlyFigures (BR-PRJ-2)', () => {
  it('combines one-off + recurring spend and income per month', () => {
    const rent: Recurring = {
      id: 'rent',
      amount: 800,
      category: 'Rent',
      dayOfMonth: 1,
      active: true,
      createdAt: '2026-01-01',
    }
    const figures = monthlyFigures(
      [spend('e1', 100, 'Food', '2026-02-05')],
      [rent],
      [salary(2000, '2026-01-01')],
      '2026-02'
    )
    expect(figures).toEqual([
      { month: '2026-01', spend: 800, income: 2000, net: 1200 },
      { month: '2026-02', spend: 900, income: 2000, net: 1100 },
    ])
  })

  it('stops income after endedAt (BR-INC-3) and excludes inactive recurring', () => {
    const ended: IncomeSource = {
      ...salary(1000, '2026-01-01'),
      active: false,
      endedAt: '2026-02-10',
    }
    const inactive: Recurring = {
      id: 'gym',
      amount: 30,
      category: 'Health',
      dayOfMonth: 5,
      active: false,
      createdAt: '2026-01-01',
    }
    const figures = monthlyFigures([], [inactive], [ended], '2026-03')
    expect(figures).toEqual([
      { month: '2026-01', spend: 0, income: 1000, net: 1000 },
      { month: '2026-02', spend: 0, income: 1000, net: 1000 },
    ])
  })
})

describe('windowAverages (income-aware, resolves TICKET-015)', () => {
  const figures = [
    { month: '2026-01', spend: 1000, income: 2000, net: 1000 },
    { month: '2026-02', spend: 1500, income: 2000, net: 500 },
    { month: '2026-03', spend: 500, income: 2000, net: 1500 },
  ]

  it('averages spend and saving over the last window months', () => {
    const avg = windowAverages(figures, 3)
    expect(avg.avgSpend).toBe(1000)
    expect(avg.avgSaving).toBe(1000)
    expect(avg.months).toBe(3)
  })

  it('uses only the available months when fewer exist', () => {
    const avg = windowAverages(figures, 12)
    expect(avg.months).toBe(3)
    expect(avg.avgSaving).toBe(1000)
  })
})

describe('cumulativeNet', () => {
  it('accumulates net month over month', () => {
    const out = cumulativeNet([
      { month: '2026-01', spend: 1, income: 2, net: 1 },
      { month: '2026-02', spend: 1, income: 2, net: 1 },
    ])
    expect(out).toEqual([
      { month: '2026-01', balance: 1 },
      { month: '2026-02', balance: 2 },
    ])
  })
})

describe('expectedSpend (BR-PRJ-1, 3-month average)', () => {
  const figures = [
    { month: '2026-01', spend: 900, income: 0, net: -900 },
    { month: '2026-02', spend: 1200, income: 0, net: -1200 },
    { month: '2026-03', spend: 300, income: 0, net: -300 },
    { month: '2026-04', spend: 999, income: 0, net: -999 },
  ]

  it('averages the up-to-3 months before the selected one', () => {
    expect(expectedSpend(figures, '2026-04')).toBe(800) // avg(900,1200,300)
  })

  it('averages what exists with fewer prior months', () => {
    expect(expectedSpend(figures, '2026-02')).toBe(900)
  })

  it('is null with no prior month', () => {
    expect(expectedSpend(figures, '2026-01')).toBeNull()
  })
})

describe('monthFunnel (BR-PRJ-1)', () => {
  it('keeps income = fixed + other + saved with Rent/Bills fixed', () => {
    const items = [
      spend('r', 800, 'Rent', '2026-08-01'),
      spend('b', 200, 'Bills', '2026-08-02'),
      spend('f', 300, 'Food', '2026-08-03'),
    ]
    const f = monthFunnel(items, 1500)
    expect(f.fixed).toBe(1000)
    expect(f.other).toBe(300)
    expect(f.saved).toBe(200)
    expect(f.income).toBe(f.fixed + f.other + f.saved)
  })

  it('reports a negative saving when overspending', () => {
    const f = monthFunnel([spend('f', 300, 'Food', '2026-08-01')], 100)
    expect(f.saved).toBe(-200)
  })
})
