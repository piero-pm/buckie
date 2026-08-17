import type { RawRecord } from '../api/records'
import type { VaultJsonBundle } from '../api/vault'

/**
 * Encrypted backup bundle (BA-DS-009 BR-EXP-1/2). The file carries only what
 * the server already stores: the non-secret vault envelope plus every record
 * ciphertext. Without the passphrase it reveals no amounts, labels, or notes.
 */
export interface BackupBundle {
  version: 1
  exportedAt: string
  vault: VaultJsonBundle
  records: RawRecord[]
}

const KINDS = ['expense', 'recurring', 'income']

/** Assembles the export bundle from server data (BR-EXP-1). */
export function buildBundle(
  vault: VaultJsonBundle,
  records: RawRecord[],
  now = new Date()
): BackupBundle {
  return {
    version: 1,
    exportedAt: now.toISOString(),
    vault,
    records: [...records],
  }
}

/** Parses + validates a bundle file; throws a clear Error on anything
 * malformed so import can abort before writing (BR-IMP-1). */
export function parseBundle(text: string): BackupBundle {
  const j = tryParse(text)
  if (j.version !== 1) throw new Error('Unrecognized backup version.')
  const vault = j.vault as Partial<VaultJsonBundle>
  if (typeof vault.salt !== 'string') throw err('missing salt')
  assertB64(vault.salt, 'salt')
  if (typeof vault.params !== 'string' || !vault.params) {
    throw err('missing KDF params')
  }
  if (typeof vault.verifier !== 'string') throw err('missing verifier')
  assertB64(vault.verifier, 'verifier')
  if (!Array.isArray(j.records)) throw err('missing records')
  for (const r of j.records as Partial<RawRecord>[]) {
    if (typeof r.id !== 'string' || !r.id || r.id.includes('/')) {
      throw err('bad record id')
    }
    if (typeof r.kind !== 'string' || !KINDS.includes(r.kind)) {
      throw err('bad record kind')
    }
    if (typeof r.ciphertext !== 'string') throw err('bad record ciphertext')
    assertB64(r.ciphertext, 'record ciphertext')
  }
  return {
    version: 1,
    exportedAt: typeof j.exportedAt === 'string' ? j.exportedAt : '',
    vault: vault as VaultJsonBundle,
    records: j.records as RawRecord[],
  }
}

/** Serializes + downloads the bundle as one JSON file (BR-EXP-1). */
export function downloadBundle(bundle: BackupBundle): void {
  const stamp = bundle.exportedAt.slice(0, 16).replace(/[-:T]/g, '')
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `buckie-backup-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function tryParse(text: string): Record<string, unknown> {
  try {
    const j = JSON.parse(text)
    if (j && typeof j === 'object') return j as Record<string, unknown>
  } catch {
    // fall through to the shared message
  }
  throw new Error('Not a valid backup file.')
}

function assertB64(value: string, what: string): void {
  try {
    atob(value)
  } catch {
    throw err(`corrupt ${what}`)
  }
}

function err(detail: string): Error {
  return new Error(`Unrecognized backup file: ${detail}.`)
}
