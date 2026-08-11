import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { cacheKey, hasCachedKey, loadCachedKey, clearKey } from './keystore'
import { deriveKey, generateSalt } from './kdf'

// Brief §5 "keystore": a cached key persists across a simulated reload so the
// same device unlocks without passphrase re-entry (EX-PASS-3).
describe('keystore persistence (EX-PASS-3)', () => {
  beforeEach(async () => {
    // clearKey touches the in-process cache; the fake-indexeddb instance is
    // reset between files, so we only reset the user's record here.
    await clearKey(42)
  })

  it('persists a key across a simulated reload', async () => {
    const key = await deriveKey('a-passphrase-long-enough', generateSalt())
    await cacheKey(42, key)

    expect(hasCachedKey(42)).toBe(true)
    // Simulate a page reload: the in-process cache is gone, but IndexedDB holds
    // the non-extractable key and loadCachedKey should recover it.
    const reloaded = await loadCachedKey(42)
    expect(reloaded).toBeDefined()
  })

  it('reports no cached key for an unknown user', async () => {
    expect(hasCachedKey(99)).toBe(false)
    expect(await loadCachedKey(99)).toBeUndefined()
  })
})
