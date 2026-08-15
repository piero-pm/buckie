import { describe, it, expect } from 'vitest'
import { validateIncomeSource } from './income'

describe('income source validation (BR-INC-1/2, TICKET-020)', () => {
  it('accepts a valid source (EX-INC-1)', () => {
    const r = validateIncomeSource({
      amount: 2500.5,
      kind: 'salary',
      label: 'Acme payroll',
      dayOfMonth: 27,
    })
    expect(r.ok).toBe(true)
  })

  it('refuses an unknown kind (BR-INC-1)', () => {
    expect(validateIncomeSource({ amount: 100, kind: 'lottery' }).ok).toBe(
      false
    )
  })

  it('refuses zero and negative amounts (EX-INC-2)', () => {
    expect(validateIncomeSource({ amount: 0, kind: 'salary' }).ok).toBe(false)
    expect(validateIncomeSource({ amount: -5, kind: 'savings' }).ok).toBe(false)
  })

  it('refuses over two decimals and the sane maximum (EX-INC-2)', () => {
    expect(
      validateIncomeSource({ amount: 10.123, kind: 'investment' }).ok
    ).toBe(false)
    expect(validateIncomeSource({ amount: 1_000_001, kind: 'salary' }).ok).toBe(
      false
    )
  })

  it('refuses long labels and days outside 1..31', () => {
    expect(
      validateIncomeSource({
        amount: 10,
        kind: 'salary',
        label: 'x'.repeat(41),
      }).ok
    ).toBe(false)
    expect(
      validateIncomeSource({ amount: 10, kind: 'salary', dayOfMonth: 32 }).ok
    ).toBe(false)
  })
})
