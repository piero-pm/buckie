import { describe, it, expect } from 'vitest'
import { buildBundle, parseBundle } from './backup'
import type { RawRecord } from '../api/records'
import type { VaultJsonBundle } from '../api/vault'

const vault: VaultJsonBundle = {
  salt: 'c2FsdA==',
  params: '{"m":65536,"t":3,"p":1,"dkLen":32}',
  verifier: 'dmVyaWZpZXI=',
}

const records: RawRecord[] = [
  { id: 'rec-1', kind: 'expense', ciphertext: 'YW1vdW50OjEyLjM0' },
  { id: 'rec-2', kind: 'income', ciphertext: 'c2FsYXJ5' },
]

describe('buildBundle (BR-EXP-1/2)', () => {
  it('carries the envelope and every record ciphertext', () => {
    const b = buildBundle(vault, records, new Date('2026-08-16T12:00:00Z'))
    expect(b.version).toBe(1)
    expect(b.exportedAt).toBe('2026-08-16T12:00:00.000Z')
    expect(b.vault).toEqual(vault)
    expect(b.records).toHaveLength(2)
  })

  it('contains no plaintext amounts in its raw serialization', () => {
    const text = JSON.stringify(buildBundle(vault, records))
    expect(text).not.toContain('12.34')
    expect(text).toContain('YW1vdW50OjEyLjM0')
  })
})

describe('parseBundle (BR-IMP-1)', () => {
  it('round-trips a bundle built by buildBundle', () => {
    const now = new Date('2026-08-16T12:00:00Z')
    const text = JSON.stringify(buildBundle(vault, records, now))
    expect(parseBundle(text)).toEqual(buildBundle(vault, records, now))
  })

  it('rejects non-JSON', () => {
    expect(() => parseBundle('not json')).toThrow(/not a valid backup/i)
  })

  it('rejects an unknown version', () => {
    const b = { ...buildBundle(vault, records), version: 2 }
    expect(() => parseBundle(JSON.stringify(b))).toThrow(/version/i)
  })

  it('rejects a missing vault field', () => {
    const b = buildBundle(vault, records)
    expect(() =>
      parseBundle(
        JSON.stringify({ ...b, vault: { ...vault, salt: undefined } })
      )
    ).toThrow(/missing salt/i)
  })

  it('rejects corrupt base64', () => {
    const b = buildBundle(vault, records)
    const bad = { ...b, vault: { ...vault, verifier: '!!not-base64!!' } }
    expect(() => parseBundle(JSON.stringify(bad))).toThrow(/verifier/i)
  })

  it('rejects an unknown record kind', () => {
    const b = buildBundle(vault, [
      { id: 'x', kind: 'budget' as RawRecord['kind'], ciphertext: 'eHg=' },
    ])
    expect(() => parseBundle(JSON.stringify(b))).toThrow(/kind/i)
  })

  it('rejects an id that could confuse routing', () => {
    const b = buildBundle(vault, [{ ...records[0], id: 'a/b' }])
    expect(() => parseBundle(JSON.stringify(b))).toThrow(/id/i)
  })
})
