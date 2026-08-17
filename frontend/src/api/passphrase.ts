import { raw } from './records'
import { getVault, replaceEnvelope } from './vault'
import {
  cacheKey,
  decrypt,
  deriveReplacement,
  encrypt,
  unlockVault,
} from '../crypto'

/**
 * Full passphrase-change flow (BA-DS-009 BR-PASS-1..3, TICKET-035). Verifies
 * the current passphrase against the stored verifier, re-encrypts every
 * record under a newly derived key, and swaps the server envelope LAST. The
 * new key is cached only after the swap. A record already migrated by a
 * failed earlier attempt decrypts under either key, so the flow is safe to
 * retry as long as the user stays on the page.
 */
export async function changePassphrase(
  userId: number,
  current: string,
  next: string
): Promise<void> {
  const status = await getVault()
  if (!status.envelope) throw new Error('no passphrase set')
  const oldKey = await unlockVault(userId, current, status.envelope)
  const { key: newKey, envelope } = await deriveReplacement(next)
  const records = await raw.listAll()
  for (const r of records) {
    const plain = await decryptEither(oldKey, newKey, fromB64(r.ciphertext))
    const cipher = await encrypt(newKey, plain)
    await raw.put({ ...r, ciphertext: toB64(cipher) })
  }
  await replaceEnvelope({
    salt: toB64(envelope.salt),
    params: JSON.stringify(envelope.params),
    verifier: toB64(envelope.verifier),
  })
  await cacheKey(userId, newKey)
}

async function decryptEither(
  oldKey: CryptoKey,
  newKey: CryptoKey,
  bytes: Uint8Array
): Promise<Uint8Array> {
  try {
    return await decrypt(oldKey, bytes)
  } catch {
    try {
      return await decrypt(newKey, bytes)
    } catch {
      throw new Error('record could not be decrypted')
    }
  }
}

function toB64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
