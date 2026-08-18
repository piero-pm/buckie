import { describe, it, expect, beforeEach } from 'vitest'
import {
  DEFAULT_SETTINGS,
  formatMoney,
  setActiveCurrency,
  validateSettings,
} from './settings'

describe('settings validation (BR-CUR-1, BR-LOCK-IDLE-1)', () => {
  it('accepts known currencies and idle options', () => {
    expect(validateSettings({ currency: 'USD', idleLockMinutes: 5 })).toEqual({
      ok: true,
    })
    expect(validateSettings({ currency: 'EUR', idleLockMinutes: 0 })).toEqual({
      ok: true,
    })
  })

  it('rejects unknown currencies and idle windows', () => {
    expect(validateSettings({ currency: 'BTC', idleLockMinutes: 5 }).ok).toBe(
      false
    )
    expect(validateSettings({ currency: 'EUR', idleLockMinutes: 7 }).ok).toBe(
      false
    )
  })

  it('defaults to EUR and Never', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      id: 'settings',
      currency: 'EUR',
      idleLockMinutes: 0,
    })
  })
})

describe('formatMoney (EX-NU-5)', () => {
  beforeEach(() => setActiveCurrency('EUR'))

  it('formats in the active currency without converting', () => {
    expect(formatMoney(12.5)).toBe('€12.50')
    setActiveCurrency('USD')
    expect(formatMoney(12.5)).toBe('$12.50')
    setActiveCurrency('PLN')
    expect(formatMoney(12.5)).toBe('12.50 zł')
  })

  it('accepts an explicit currency override', () => {
    expect(formatMoney(1000, 'GBP')).toBe('£1000.00')
  })
})
