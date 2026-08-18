import { describe, it, expect } from 'vitest'
import { validateIncomeEvent } from './incomeEvent'

const input = {
  amount: 500,
  date: '2026-06-15',
  eventKind: 'bonus',
}

describe('validateIncomeEvent (BR-IOFF-1)', () => {
  it('accepts a valid event', () => {
    expect(validateIncomeEvent(input)).toEqual({ ok: true })
    expect(validateIncomeEvent({ ...input, note: 'yearly bonus' })).toEqual({
      ok: true,
    })
  })

  it('rejects unknown event kinds', () => {
    const r = validateIncomeEvent({ ...input, eventKind: 'lottery' })
    expect(r).toEqual({
      ok: false,
      field: 'kind',
      error: 'Choose an event kind.',
    })
  })

  it('rejects non-positive or over-precise amounts', () => {
    expect(validateIncomeEvent({ ...input, amount: 0 }).ok).toBe(false)
    expect(validateIncomeEvent({ ...input, amount: -5 }).ok).toBe(false)
    expect(validateIncomeEvent({ ...input, amount: 5.123 }).ok).toBe(false)
    expect(validateIncomeEvent({ ...input, amount: 2_000_000 }).ok).toBe(false)
  })

  it('rejects malformed dates', () => {
    expect(validateIncomeEvent({ ...input, date: '2026-6-15' }).ok).toBe(false)
    expect(validateIncomeEvent({ ...input, date: '' }).ok).toBe(false)
  })

  it('rejects over-long notes', () => {
    const r = validateIncomeEvent({ ...input, note: 'x'.repeat(81) })
    expect(r.ok).toBe(false)
  })
})
