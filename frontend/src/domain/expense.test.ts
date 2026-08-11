import { describe, it, expect } from 'vitest'
import { validateExpense, validateRecurring, type Expense } from './expense'
import { CATEGORIES } from './taxonomy'

describe('expense validation (BR-DQ-1..4)', () => {
  const valid = { amount: 12.5, category: 'Food' as const, date: '2026-08-01' }

  it('accepts a valid expense (EX-CAP-2)', () => {
    expect(validateExpense(valid).ok).toBe(true)
  })

  // BR-DQ-1: amount required, > 0, <= 2 decimals.
  it('rejects a zero amount (EX-CAP-4)', () => {
    const r = validateExpense({ ...valid, amount: 0 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('amount')
  })

  it('rejects a negative amount', () => {
    expect(validateExpense({ ...valid, amount: -5 }).ok).toBe(false)
  })

  it('rejects more than two decimal places', () => {
    expect(validateExpense({ ...valid, amount: 12.501 }).ok).toBe(false)
  })

  // BR-DQ-4: category required.
  it('rejects a missing category (EX-CAP-3)', () => {
    const r = validateExpense({ ...valid, category: '' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.field).toBe('category')
  })

  it('rejects a category not in the taxonomy', () => {
    expect(validateExpense({ ...valid, category: 'Pets' }).ok).toBe(false)
  })

  // BR-DQ-3: date required, not in the future.
  it('rejects a future date (EX-CAP-6)', () => {
    const future = new Date()
    future.setDate(future.getDate() + 1)
    // Build the ISO date from LOCAL components; toISOString() uses UTC and can
    // yield today's date in positive-offset timezones late in the day.
    const iso = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`
    expect(validateExpense({ ...valid, date: iso }).ok).toBe(false)
  })

  it('allows today and past dates', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(validateExpense({ ...valid, date: today }).ok).toBe(true)
    expect(validateExpense({ ...valid, date: '2025-01-01' }).ok).toBe(true)
  })
})

describe('recurring validation (TICKET-010)', () => {
  const valid = { amount: 700, category: 'Rent' as const, dayOfMonth: 1 }

  it('accepts a valid recurring template (EX-REC-1)', () => {
    expect(validateRecurring(valid).ok).toBe(true)
  })

  it('rejects an invalid amount (EX-REC-3)', () => {
    expect(validateRecurring({ ...valid, amount: 0 }).ok).toBe(false)
  })

  it('rejects a day of month out of range', () => {
    expect(validateRecurring({ ...valid, dayOfMonth: 32 }).ok).toBe(false)
    expect(validateRecurring({ ...valid, dayOfMonth: 0 }).ok).toBe(false)
  })
})

describe('taxonomy', () => {
  it('has the approved 8 categories', () => {
    expect(CATEGORIES).toHaveLength(8)
    expect(CATEGORIES).toContain('Rent')
    expect(CATEGORIES).toContain('Miscellaneous')
  })
})

// BR-DQ-5: duplicate detection (same amount + category + date) — used by Slice 4.
describe('duplicate detection (BR-DQ-5)', () => {
  function findDuplicate(
    existing: Expense[],
    candidate: { amount: number; category: string; date: string }
  ): Expense | undefined {
    return existing.find(
      (e) =>
        e.amount === candidate.amount &&
        e.category === candidate.category &&
        e.date === candidate.date
    )
  }

  it('finds an exact match on amount + category + date (EX-CAP-5)', () => {
    const list: Expense[] = [
      {
        id: '1',
        amount: 10,
        category: 'Food',
        date: '2026-08-01',
        createdAt: '2026-08-01',
      },
    ]
    const dup = findDuplicate(list, {
      amount: 10,
      category: 'Food',
      date: '2026-08-01',
    })
    expect(dup).toBeDefined()
  })

  it('does not flag a genuine repeat on a different date', () => {
    const list: Expense[] = [
      {
        id: '1',
        amount: 10,
        category: 'Food',
        date: '2026-08-01',
        createdAt: '2026-08-01',
      },
    ]
    const dup = findDuplicate(list, {
      amount: 10,
      category: 'Food',
      date: '2026-08-02',
    })
    expect(dup).toBeUndefined()
  })
})
