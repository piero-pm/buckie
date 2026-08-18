import { vi, describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { changePassphrase } from './passphrase'
import { decrypt, deriveKey, encrypt, setupVault } from '../crypto'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const OLD = 'old-passphrase-123'
const NEW = 'new-passphrase-456'

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes))
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

function calls() {
  return mockFetch.mock.calls.map(([url, init]) => ({
    url: url as string,
    method: (init as RequestInit | undefined)?.method ?? 'GET',
  }))
}

function vaultResponse(envelope: {
  salt: Uint8Array
  params: unknown
  verifier: Uint8Array
}) {
  return {
    ok: true,
    json: async () => ({
      hasPassphrase: true,
      salt: b64(envelope.salt),
      params: JSON.stringify(envelope.params),
      verifier: b64(envelope.verifier),
    }),
  }
}

describe('changePassphrase (BA-DS-009 BR-PASS-1..3)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  // EX-PASS-2: wrong current passphrase is refused before anything is written.
  it('refuses a wrong current passphrase with no writes', async () => {
    const { envelope } = await setupVault(21, OLD)
    mockFetch.mockResolvedValueOnce(vaultResponse(envelope))

    await expect(changePassphrase(21, 'wrong-current', NEW)).rejects.toThrow(
      /wrong passphrase/i
    )
    expect(mockFetch).toHaveBeenCalledTimes(1) // the vault GET only
  }, 20000) // 2 Argon2 derivations; default 5s can flake under load

  // EX-PASS-1: every record re-encrypts under the new key; envelope last.
  it('re-encrypts all records and swaps the envelope last', async () => {
    const userId = 22
    const { key: oldKey, envelope } = await setupVault(userId, OLD)
    const enc = async (text: string) =>
      b64(await encrypt(oldKey, new TextEncoder().encode(text)))
    const payloadA = JSON.stringify({ id: 'a', amount: 12.34 })
    const payloadB = JSON.stringify({ id: 'b', amount: 56.78 })
    const recordA = {
      id: 'a',
      kind: 'expense',
      ciphertext: await enc(payloadA),
    }
    const recordB = { id: 'b', kind: 'income', ciphertext: await enc(payloadB) }
    const empty = { ok: true, json: async () => ({ records: [] }) }

    mockFetch
      .mockResolvedValueOnce(vaultResponse(envelope))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [recordA] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [recordB] }),
      })
      .mockResolvedValueOnce(empty) // remaining kind lists (recurring etc.)
      .mockResolvedValueOnce(empty)
      .mockResolvedValueOnce(empty)
      .mockResolvedValueOnce(empty) // settings list (WORK-007)
      .mockResolvedValue({ ok: true, json: async () => ({}) }) // PUTs

    await changePassphrase(userId, OLD, NEW)

    const seq = calls()
    const envelopePut = seq.findIndex(
      (c) => c.url === '/api/vault' && c.method === 'PUT'
    )
    expect(envelopePut).toBe(seq.length - 1) // envelope LAST (BR-PASS-2)
    expect(
      seq.filter((c) => c.method === 'PUT' && c.url.startsWith('/api/records'))
    ).toHaveLength(2)

    // The swapped envelope verifies under the new passphrase.
    const envBody = JSON.parse(mockFetch.mock.calls[envelopePut][1].body)
    const newKey = await deriveKey(
      NEW,
      unb64(envBody.salt),
      JSON.parse(envBody.params)
    )
    const plain = await decrypt(newKey, unb64(envBody.verifier))
    expect(new TextDecoder().decode(plain)).toBe('buckie-vault-v1')

    // Each record PUT decrypts under the new key to its original JSON.
    for (const [id, expected] of [
      ['a', payloadA],
      ['b', payloadB],
    ] as const) {
      const call = mockFetch.mock.calls.find(
        (c) => c[0] === `/api/records/${id}`
      )
      if (!call) throw new Error(`missing PUT for record ${id}`)
      const body = JSON.parse(call[1].body)
      const out = await decrypt(newKey, unb64(body.ciphertext))
      expect(new TextDecoder().decode(out)).toBe(expected)
    }
  }, 30000) // 3 Argon2 derivations; default 5s flakes under load
})
