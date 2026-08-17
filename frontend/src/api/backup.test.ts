import { vi, describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { restoreBundle } from './backup'
import { buildBundle } from '../domain/backup'
import { encrypt } from '../crypto/cipher'
import type { VaultJsonBundle } from './vault'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const ok = { ok: true, json: async () => ({}) }

const vaultPart = (verifier: string): VaultJsonBundle => ({
  salt: 'c2FsdA==',
  params: '{"m":65536,"t":3,"p":1,"dkLen":32}',
  verifier,
})

/** Seeds a key for `userId` and returns a verifier encrypted under it. */
async function seedKey(userId: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    crypto.getRandomValues(new Uint8Array(32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  )
  const verifier = await encrypt(
    key,
    new TextEncoder().encode('buckie-vault-v1')
  )
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('buckie', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('keys')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite')
    tx.objectStore('keys').put(key, userId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  let bin = ''
  for (const b of verifier) bin += String.fromCharCode(b)
  return btoa(bin)
}

describe('restoreBundle (BA-DS-009)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  // EX-IMP-1: fresh account adopts the envelope, then replays every record.
  it('setup mode posts the envelope then upserts all records', async () => {
    mockFetch.mockResolvedValue(ok)
    const bundle = buildBundle(vaultPart('dmVyaWZpZXI='), [
      { id: 'r1', kind: 'expense', ciphertext: 'eHIx' },
      { id: 'r2', kind: 'income', ciphertext: 'eHIy' },
    ])
    await restoreBundle(1, bundle, 'setup')
    expect(mockFetch).toHaveBeenCalledTimes(3)
    expect(mockFetch.mock.calls[0][0]).toBe('/api/vault')
    expect(mockFetch.mock.calls[0][1].method).toBe('POST')
    expect(mockFetch.mock.calls[1][0]).toBe('/api/records/r1')
    expect(mockFetch.mock.calls[1][1].method).toBe('PUT')
    expect(mockFetch.mock.calls[2][0]).toBe('/api/records/r2')
  })

  // EX-IMP-2: a different-passphrase bundle is refused; nothing is written.
  it('help mode refuses a wrong-key bundle without any writes', async () => {
    await seedKey(2)
    const bundle = buildBundle(vaultPart('ZGlmZmVyZW50'), [
      { id: 'r1', kind: 'expense', ciphertext: 'eHIx' },
    ])
    await expect(restoreBundle(2, bundle, 'help')).rejects.toThrow('wrong-key')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // EX-IMP-3: same-key bundle merges — records replay over the account.
  it('help mode replays records for a matching key', async () => {
    mockFetch.mockResolvedValue(ok)
    const verifier = await seedKey(3)
    const bundle = buildBundle(vaultPart(verifier), [
      { id: 'r1', kind: 'recurring', ciphertext: 'eHIx' },
    ])
    await restoreBundle(3, bundle, 'help')
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0][0]).toBe('/api/records/r1')
    expect(mockFetch.mock.calls[0][1].method).toBe('PUT')
  })
})
