import { describe, it, expect } from 'vitest'
import { setupVault, unlockVault } from './vault'

const GOOD = 'correct-horse-battery-staple'

describe('vault verifier (ADR-002/003, EX-PASS-4)', () => {
  // Brief §5 "wrong-passphrase": a wrong passphrase fails to unlock and
  // reveals nothing. unlockVault re-derives a key and tries to decrypt the
  // verifier; the wrong key fails GCM authentication -> throws.
  it('refuses a wrong passphrase without revealing data', async () => {
    const { envelope } = await setupVault(1, GOOD)

    await expect(
      unlockVault(1, 'totally-wrong-passphrase', envelope)
    ).rejects.toThrow(/wrong passphrase/i)
  })

  it('accepts the correct passphrase and unlocks', async () => {
    const { envelope } = await setupVault(2, GOOD)
    await expect(unlockVault(2, GOOD, envelope)).resolves.toBeDefined()
  })
})
