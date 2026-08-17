import { describe, it, expect } from 'vitest'
import { validatePassphrasePolicy } from './passphrase'

// BR-PASS-1 applies the BA-DS-001 setup rules to the new passphrase.
describe('validatePassphrasePolicy', () => {
  it('rejects a too-short passphrase', () => {
    expect(validatePassphrasePolicy('short1', 'short1')).toMatch(/at least 12/i)
  })

  it('rejects non-alphanumeric characters', () => {
    expect(
      validatePassphrasePolicy('long-enough-pass', 'long-enough-pass')
    ).toMatch(/letters and numbers/i)
  })

  it('rejects a confirmation mismatch', () => {
    expect(validatePassphrasePolicy('longenough123', 'different123')).toMatch(
      /do not match/i
    )
  })

  it('accepts a valid confirmed passphrase', () => {
    expect(
      validatePassphrasePolicy('longenough123', 'longenough123')
    ).toBeNull()
  })
})
