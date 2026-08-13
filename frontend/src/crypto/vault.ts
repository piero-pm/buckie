import { decrypt, encrypt } from './cipher'
import { deriveKey, generateSalt, type KdfParams } from './kdf'
import { cacheKey } from './keystore'

/**
 * The non-secret envelope persisted server-side per user. `verifier` is the
 * AES-256-GCM encryption of a fixed marker under the derived key; a correct
 * passphrase re-derives the key and decrypts it, a wrong one fails GCM auth.
 * Salt + params are non-secret and let any device re-derive the key.
 */
export interface VaultEnvelope {
  salt: Uint8Array
  params: KdfParams
  verifier: Uint8Array
}

/** A derived vault: the unlocked key plus the envelope it came from. */
export interface DerivedVault {
  key: CryptoKey
  envelope: VaultEnvelope
}

/** Fixed plaintext marker; correctness of decrypt signals the right key. */
const VERIFIER_PLAINTEXT = new TextEncoder().encode('buckie-vault-v1')

/**
 * First-time setup: derives a fresh key from the passphrase, encrypts the
 * verifier marker, and caches the key on this device. The caller persists the
 * returned envelope (ciphertext-only) on the server; the passphrase/key never
 * leave the browser.
 */
export async function setupVault(
  userId: number,
  passphrase: string
): Promise<DerivedVault> {
  const salt = generateSalt()
  const key = await deriveKey(passphrase, salt)
  const verifier = await encrypt(key, VERIFIER_PLAINTEXT)
  const envelope: VaultEnvelope = {
    salt,
    params: { ...DEFAULT_PARAMS() },
    verifier,
  }
  await cacheKey(userId, key)
  return { key, envelope }
}

/**
 * Unlock on any device: re-derives the key from the passphrase + the stored
 * envelope's salt/params, then tries to decrypt the verifier. Success means the
 * passphrase is correct (the key is cached and returned); a GCM auth failure
 * means wrong passphrase and nothing is revealed or cached.
 */
export async function unlockVault(
  userId: number,
  passphrase: string,
  envelope: VaultEnvelope
): Promise<CryptoKey> {
  const key = await deriveKey(passphrase, envelope.salt, envelope.params)
  let plain: Uint8Array
  try {
    plain = await decrypt(key, envelope.verifier)
  } catch {
    // GCM authentication failure: the derived key cannot validate the verifier,
    // i.e. the passphrase is wrong. Reveal nothing, cache nothing.
    throw new Error('wrong passphrase')
  }
  if (!bytesEqual(plain, VERIFIER_PLAINTEXT)) {
    throw new Error('wrong passphrase')
  }
  await cacheKey(userId, key)
  return key
}

function DEFAULT_PARAMS(): KdfParams {
  return { m: 65536, t: 3, p: 1, dkLen: 32 }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}
