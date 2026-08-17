import { describe, it, expect } from 'vitest'
import { toExpectations, validateExpectations } from './expectations'
import { EXPECTATIONS_ID } from './ids'

describe('validateExpectations (BR-EXP-SET-1)', () => {
  const valid = { startingBalance: 1500, expected: { groceries: 300 } }

  it('accepts a valid plan', () => {
    expect(validateExpectations(valid)).toBeNull()
  })

  it('accepts a negative starting balance (overdrawn)', () => {
    expect(validateExpectations({ ...valid, startingBalance: -50 })).toBeNull()
  })

  it('rejects a non-finite balance', () => {
    expect(
      validateExpectations({ ...valid, startingBalance: NaN })
    ).not.toBeNull()
  })

  it('rejects a zero or three-decimal expected amount', () => {
    expect(validateExpectations({ ...valid, expected: { rent: 0 } })).toContain(
      'Rent'
    )
    expect(
      validateExpectations({ ...valid, expected: { bills: 10.123 } })
    ).toContain('Bills')
  })

  it('allows unset optional buckets', () => {
    expect(
      validateExpectations({ startingBalance: 0, expected: {} })
    ).toBeNull()
  })
})

describe('toExpectations', () => {
  it('uses the fixed record id and drops empty amounts', () => {
    const record = toExpectations(1500, {
      rent: 700,
      groceries: 300,
      goingOut: 0, // zero means "not set" — dropped
      shopping: NaN,
    })
    expect(record.id).toBe(EXPECTATIONS_ID)
    expect(record.expected).toEqual({ rent: 700, groceries: 300 })
    expect(record.updatedAt).toBeTruthy()
  })
})
