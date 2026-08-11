import { argon2idAsync } from '@noble/hashes/argon2.js'

/**
 * Argon2id parameters. OWASP-tier memory-hard defaults (m=64 MiB, t=3, p=1),
 * tuned toward ~1s on a typical device. Revisitable per ADR-003; stored as
 * non-secret metadata alongside each user's ciphertext so any device can
 * re-derive the key. `m` is in KiB (65536 = 64 MiB).
 */
export interface KdfParams {
  /** Memory cost in KiB. 65536 = 64 MiB. */
  m: number
  /** Time cost (iterations). */
  t: number
  /** Parallelism. */
  p: number
  /** Output length in bytes (32 -> AES-256 key). */
  dkLen: number
}

export const DEFAULT_KDF_PARAMS: KdfParams = {
  m: 65536,
  t: 3,
  p: 1,
  dkLen: 32,
}

export const SALT_LENGTH = 16

/** A 16-byte cryptographically random salt. */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Derives a non-extractable AES-256-GCM CryptoKey from a passphrase and salt
 * using Argon2id (@noble/hashes) then WebCrypto importKey. The raw key material
 * never leaves the derivation; the returned key cannot be exported.
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  params: KdfParams = DEFAULT_KDF_PARAMS
): Promise<CryptoKey> {
  const raw = await argon2idAsync(passphrase, salt, params)
  // Copy into a concrete-ArrayBuffer view; argon2idAsync returns Uint8Array over
  // ArrayBufferLike, which WebCrypto's BufferSource type rejects under TS 5.7+.
  const keyBytes = new Uint8Array(raw) as Uint8Array<ArrayBuffer>
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}
