import { describe, it, expect } from 'vitest'
import { deriveKey, generateSalt } from './kdf'
import { encrypt, decrypt } from './cipher'

const eq = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((v, i) => v === b[i])

describe('Argon2id KDF (ADR-003)', () => {
  // Brief §5 "derive": same passphrase + salt -> same key; different salt -> different.
  it('derives the same key for the same passphrase + salt', async () => {
    const salt = generateSalt()
    const a = await deriveKey('a-passphrase-long-enough', salt)
    const b = await deriveKey('a-passphrase-long-enough', salt)

    // Indistinguishable keys encrypt to ciphertexts that mutually decrypt.
    const msg = new TextEncoder().encode('hello vault')
    expect(eq(await decrypt(b, await encrypt(a, msg)), msg)).toBe(true)
  })

  it('derives a different key for a different salt', async () => {
    const k1 = await deriveKey('a-passphrase-long-enough', generateSalt())
    const k2 = await deriveKey('a-passphrase-long-enough', generateSalt())

    const msg = new TextEncoder().encode('hello vault')
    const blob = await encrypt(k1, msg)
    // k2 must NOT decrypt k1's ciphertext (different key, GCM auth fails).
    await expect(decrypt(k2, blob)).rejects.toThrow()
  })
})
