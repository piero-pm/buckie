import { raw } from './records'
import { restoreEnvelope } from './vault'
import { loadCachedKey, verifierMatches } from '../crypto'
import type { BackupBundle } from '../domain/backup'

/** BR-IMP-2: true when the bundle's verifier decrypts under this device's
 * cached key — proves the bundle belongs to this account's passphrase. */
export async function bundleMatchesKey(
  userId: number,
  bundle: BackupBundle
): Promise<boolean> {
  const key = await loadCachedKey(userId)
  if (!key) return false
  return verifierMatches(key, fromB64(bundle.vault.verifier))
}

/** Full restore flow (BA-DS-009 BR-IMP-1..4). Setup mode adopts the bundle's
 * envelope on a fresh account; help mode requires the bundle to decrypt under
 * the current key (throws Error('wrong-key') otherwise). Records then merge:
 * newer local records stay, collisions take the bundle. */
export async function restoreBundle(
  userId: number,
  bundle: BackupBundle,
  mode: 'help' | 'setup'
): Promise<void> {
  if (mode === 'setup') {
    await restoreEnvelope(bundle.vault)
  } else if (!(await bundleMatchesKey(userId, bundle))) {
    throw new Error('wrong-key')
  }
  for (const r of bundle.records) await raw.put(r)
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
