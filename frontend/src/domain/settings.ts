import type { ValidationResult } from './expense'
import { SETTINGS_ID } from './ids'

/** Display currencies (BR-CUR-1, WORK-007). Formatting only — stored
 * amounts are currency-less numbers and never convert. */
export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'SEK', 'PLN'] as const
export type CurrencyCode = (typeof CURRENCIES)[number]

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  SEK: 'kr',
  PLN: 'zł',
}

/** The currency shown across the app; set once the settings record loads
 * and on every change (display-only module state, BR-CUR-1). */
let active: CurrencyCode = 'EUR'

export function setActiveCurrency(currency: CurrencyCode) {
  active = currency
}

/** Idle auto-lock windows in minutes; 0 = Never (default, gate 2026-08-18). */
export const IDLE_OPTIONS = [0, 5, 15, 30, 60] as const
export type IdleMinutes = (typeof IDLE_OPTIONS)[number]

/** Per-user display settings, stored as the fixed-id 'settings' encrypted
 * record (expectations pattern) so they roam with the vault. */
export interface Settings {
  id: string // always SETTINGS_ID
  currency: CurrencyCode
  idleLockMinutes: IdleMinutes
}

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  currency: 'EUR',
  idleLockMinutes: 0,
}

export function validateSettings(input: {
  currency: string
  idleLockMinutes: number
}): ValidationResult {
  if (!(CURRENCIES as readonly string[]).includes(input.currency)) {
    return { ok: false, field: 'kind', error: 'Choose a currency.' }
  }
  if (!(IDLE_OPTIONS as readonly number[]).includes(input.idleLockMinutes)) {
    return { ok: false, field: 'kind', error: 'Choose an auto-lock window.' }
  }
  return { ok: true }
}

/** Formats an amount in the active (or given) currency, mirroring the
 * EUR style used across the app (plain 2 decimals, symbol attached). */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = active
): string {
  const fixed = amount.toFixed(2)
  return currency === 'PLN'
    ? `${fixed} ${SYMBOLS.PLN}`
    : `${SYMBOLS[currency]}${fixed}`
}
