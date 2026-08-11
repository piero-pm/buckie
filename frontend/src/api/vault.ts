import type { KdfParams, VaultEnvelope } from '../crypto'

/** Server-side vault status: whether a passphrase is set, plus the envelope. */
export interface VaultStatus {
  hasPassphrase: boolean
  envelope?: VaultEnvelope
}

interface VaultJson {
  hasPassphrase: boolean
  salt?: string
  params?: string
  verifier?: string
}

/** Fetches the user's vault status + envelope (if any) from the server. */
export async function getVault(): Promise<VaultStatus> {
  const res = await fetch('/api/vault')
  if (!res.ok) {
    throw new Error(
      (await res.json().catch(() => ({}))).error ?? 'vault fetch failed'
    )
  }
  return toStatus(await res.json())
}

/**
 * Stores a first-time vault envelope. Throws on 409 (already set) or other
 * non-2xx; the caller treats success as "unlocked".
 */
export async function setupVault(envelope: VaultEnvelope): Promise<void> {
  const res = await fetch('/api/vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      salt: toBase64(envelope.salt),
      params: JSON.stringify(envelope.params),
      verifier: toBase64(envelope.verifier),
    }),
  })
  if (!res.ok) {
    throw new Error(
      (await res.json().catch(() => ({}))).error ?? 'setup failed'
    )
  }
}

function toStatus(j: VaultJson): VaultStatus {
  if (!j.hasPassphrase || !j.salt || !j.params || !j.verifier) {
    return { hasPassphrase: false }
  }
  return {
    hasPassphrase: true,
    envelope: {
      salt: fromBase64(j.salt),
      params: JSON.parse(j.params) as KdfParams,
      verifier: fromBase64(j.verifier),
    },
  }
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
