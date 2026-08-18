import { describe, it, expect } from 'vitest'
import {
  countWeekdays,
  monthDiff,
  monthIncome,
  sourceAmountInMonth,
  weekdayOf,
} from './income-month'
import type { IncomeSource } from './income'
import type { IncomeEvent } from './incomeEvent'

const source = (over: Partial<IncomeSource>): IncomeSource => ({
  id: 's1',
  amount: 500,
  kind: 'salary',
  active: true,
  createdAt: '2026-01-05',
  ...over,
})

describe('month math', () => {
  it('monthDiff counts months between keys', () => {
    expect(monthDiff('2026-01', '2026-01')).toBe(0)
    expect(monthDiff('2026-01', '2026-04')).toBe(3)
    expect(monthDiff('2025-11', '2026-11')).toBe(12)
    expect(monthDiff('2026-04', '2026-01')).toBe(-3)
  })

  it('countWeekdays counts a weekday in a month', () => {
    // August 2026 starts on a Saturday and has 31 days: 5 Saturdays.
    expect(countWeekdays('2026-08', 6)).toBe(5)
    expect(countWeekdays('2026-08', 0)).toBe(5) // Sundays
    expect(countWeekdays('2026-02', 1)).toBe(4) // Feb 2026 Mondays
  })

  it('weekdayOf accepts date-only and full ISO', () => {
    expect(weekdayOf('2026-08-18')).toBe(2) // Tuesday
    expect(weekdayOf('2026-08-18T09:00:00.000Z')).toBe(2)
  })
})

describe('source amount per month (BR-INC-FREQ-1)', () => {
  it('monthly pays every month from creation (TICKET-020 regression)', () => {
    const s = source({})
    expect(sourceAmountInMonth(s, '2026-08')).toBe(500)
    expect(sourceAmountInMonth(s, '2025-12')).toBe(0)
  })

  it('missing frequency behaves as monthly (existing records)', () => {
    const s = source({ createdAt: '2026-03-01T09:15:00.000Z' })
    expect(sourceAmountInMonth(s, '2026-03')).toBe(500)
  })

  it('weekly pays per weekday occurrence (EX-IC-3)', () => {
    const s = source({ frequency: 'weekly', payWeekday: 2 }) // Tuesdays
    expect(sourceAmountInMonth(s, '2026-08')).toBe(4 * 500) // 4 Tuesdays
    expect(sourceAmountInMonth(s, '2026-12')).toBe(5 * 500) // 5 Tuesdays
  })

  it('weekly defaults the weekday from the creation date', () => {
    // 2026-01-05 is a Monday.
    const s = source({ frequency: 'weekly' })
    expect(sourceAmountInMonth(s, '2026-01')).toBe(4 * 500) // 4 Mondays
  })

  it('quarterly pays every third month from creation', () => {
    const s = source({ frequency: 'quarterly', createdAt: '2026-03-10' })
    expect(sourceAmountInMonth(s, '2026-03')).toBe(500)
    expect(sourceAmountInMonth(s, '2026-05')).toBe(0)
    expect(sourceAmountInMonth(s, '2026-06')).toBe(500)
    expect(sourceAmountInMonth(s, '2026-12')).toBe(500)
  })

  it('yearly pays every twelfth month from creation', () => {
    const s = source({ frequency: 'yearly', createdAt: '2026-03-10' })
    expect(sourceAmountInMonth(s, '2026-03')).toBe(500)
    expect(sourceAmountInMonth(s, '2027-02')).toBe(0)
    expect(sourceAmountInMonth(s, '2027-03')).toBe(500)
  })

  it('ended sources keep past months only (EX-INC-3)', () => {
    const s = source({
      active: false,
      endedAt: '2026-06-20T10:00:00.000Z',
      createdAt: '2026-02-01',
    })
    expect(sourceAmountInMonth(s, '2026-06')).toBe(500)
    expect(sourceAmountInMonth(s, '2026-07')).toBe(0)
  })
})

describe('monthIncome with events (BR-IOFF-1)', () => {
  const events: IncomeEvent[] = [
    {
      id: 'v1',
      amount: 500,
      date: '2026-06-15',
      eventKind: 'bonus',
      createdAt: '2026-06-15T10:00:00.000Z',
    },
    {
      id: 'v2',
      amount: 30,
      date: '2026-07-02',
      eventKind: 'refund',
      createdAt: '2026-07-02T10:00:00.000Z',
    },
  ]

  it('adds one-off events in their month (EX-IC-2)', () => {
    const s = source({ amount: 2500 })
    expect(monthIncome([s], '2026-06', events)).toBe(3000)
    expect(monthIncome([s], '2026-07', events)).toBe(2530)
    expect(monthIncome([s], '2026-08', events)).toBe(2500)
  })

  it('events alone count with no sources', () => {
    expect(monthIncome([], '2026-06', events)).toBe(500)
  })
})
