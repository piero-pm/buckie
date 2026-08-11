/** AES-GCM uses a 96-bit (12-byte) nonce — the WebCrypto-recommended size. */
const NONCE_LENGTH = 12

/**
 * Returns a BufferSource view of bytes. TS 5.7+ (via @types/node) types
 * Uint8Array over ArrayBufferLike (incl. SharedArrayBuffer), which WebCrypto's
 * BufferSource rejects; our bytes are always concrete-ArrayBuffer-backed, so we
 * copy into one and assert the narrower type at the WebCrypto boundary.
 */
function buf(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  return copy as Uint8Array<ArrayBuffer>
}

/**
 * Encrypts plaintext bytes under a non-extractable AES-256-GCM key. A fresh
 * random 96-bit nonce is generated per call and prepended to the ciphertext so
 * the output is self-describing for decrypt(). Returns nonce || ciphertext.
 */
export async function encrypt(
  key: CryptoKey,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_LENGTH))
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: buf(nonce) },
      key,
      buf(plaintext)
    )
  )
  const out = new Uint8Array(nonce.length + cipher.length)
  out.set(nonce, 0)
  out.set(cipher, nonce.length)
  return out
}

/**
 * Decrypts a blob produced by encrypt(): reads the prepended 96-bit nonce then
 * authenticates and decrypts. A wrong key or a tampered blob fails GCM
 * authentication and throws — this is the clean "wrong passphrase" signal per
 * ADR-003, with no plaintext revealed.
 */
export async function decrypt(
  key: CryptoKey,
  blob: Uint8Array
): Promise<Uint8Array> {
  if (blob.length < NONCE_LENGTH) {
    throw new Error('ciphertext too short')
  }
  const nonce = blob.slice(0, NONCE_LENGTH)
  const cipher = blob.slice(NONCE_LENGTH)
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: buf(nonce) },
    key,
    buf(cipher)
  )
  return new Uint8Array(plain)
}
