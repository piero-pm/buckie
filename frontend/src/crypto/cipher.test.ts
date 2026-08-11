import { describe, it, expect } from 'vitest'
import { encrypt, decrypt } from './cipher'
import { deriveKey, generateSalt } from './kdf'

const eq = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((v, i) => v === b[i])

describe('AES-256-GCM cipher (ADR-003)', () => {
  // Brief §5 / ADR-003 "encrypt": round-trip restores plaintext.
  it('round-trips: decrypt(encrypt(k, p), k) === p', async () => {
    const key = await deriveKey('correct-horse-battery', generateSalt())
    const plaintext = new TextEncoder().encode('spend £12.34 on lunch')

    const blob = await encrypt(key, plaintext)
    const back = await decrypt(key, blob)

    expect(eq(back, plaintext)).toBe(true)
  })

  // ADR-003 "tamper": a flipped ciphertext/tag byte fails GCM auth.
  it('throws when ciphertext is tampered (auth failure reveals nothing)', async () => {
    const key = await deriveKey('correct-horse-battery', generateSalt())
    const plaintext = new TextEncoder().encode('secret amount')
    const blob = await encrypt(key, plaintext)

    const tampered = blob.slice()
    tampered[tampered.length - 1] ^= 0xff // flip a tag byte

    await expect(decrypt(key, tampered)).rejects.toThrow()
  })
})
