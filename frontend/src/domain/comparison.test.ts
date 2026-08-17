import { describe, it, expect } from 'vitest'
import { compareBuckets, savedThisMonth } from './comparison'
import type { Expense } from './expense'

const item = (
  id: string,
  amount: number,
  category: string,
  day = 1
): Expense => ({
  id,
  amount,
  category: category as Expense['category'],
  date: `2026-08-${String(day).padStart(2, '0')}`,
  createdAt: `2026-08-${String(day).padStart(2, '0')}`,
})

describe('compareBuckets (BR-CMP-1)', () => {
  it('maps categories to their buckets and flags overspend (EX-EA-3)', () => {
    const rows = compareBuckets(
      [
        item('1', 420, 'Groceries'),
        item('2', 60, 'Restaurants & drinks'),
        item('3', 40, 'Entertainment & culture'),
        item('4', 700, 'Rent'),
      ],
      { groceries: 300, goingOut: 200, rent: 700 }
    )
    const groceries = rows.find((r) => r.key === 'groceries')
    expect(groceries?.actual).toBe(420)
    expect(groceries?.over).toBe(true)
    expect(groceries?.delta).toBe(120)
    const goingOut = rows.find((r) => r.key === 'goingOut')
    expect(goingOut?.actual).toBe(100)
    expect(goingOut?.over).toBe(false)
    const rent = rows.find((r) => r.key === 'rent')
    expect(rent?.over).toBe(false) // equal counts as under/equal
    expect(rent?.delta).toBe(0)
  })

  it('approximates legacy categories into buckets (BR-TAX-3)', () => {
    const rows = compareBuckets(
      [item('1', 50, 'Food'), item('2', 20, 'Entertainment & Subscriptions')],
      { groceries: 100, goingOut: 100 }
    )
    expect(rows.find((r) => r.key === 'groceries')?.actual).toBe(50)
    expect(rows.find((r) => r.key === 'goingOut')?.actual).toBe(20)
  })

  it('shows actual-only for buckets without an expectation', () => {
    const rows = compareBuckets([item('1', 90, 'Bills')], {})
    const bills = rows.find((r) => r.key === 'bills')
    expect(bills?.actual).toBe(90)
    expect(bills?.over).toBeNull()
    expect(bills?.delta).toBeNull()
    expect(bills?.expected).toBeUndefined()
  })

  it('ignores categories outside the six buckets', () => {
    const rows = compareBuckets([item('1', 500, 'Transport & Travel')], {
      groceries: 100,
    })
    expect(rows.find((r) => r.key === 'groceries')?.actual).toBe(0)
  })
})

describe('savedThisMonth (BR-DASH-2)', () => {
  it('saves income minus spend', () => {
    expect(savedThisMonth(2000, 1800)).toEqual({ saved: 200, overspent: 0 })
  })

  it('clamps at zero and reports the over-spend', () => {
    expect(savedThisMonth(2000, 2100)).toEqual({ saved: 0, overspent: 100 })
  })
})
