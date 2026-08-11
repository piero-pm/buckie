import { encrypt, decrypt, loadCachedKey } from '../crypto'
import type { Expense, Recurring } from '../domain/expense'

/** Record kinds the server stores (records table `kind` column). */
type Kind = 'expense' | 'recurring'

/**
 * Encrypts a domain record with the user's cached key and stores it on the
 * server. The server receives only ciphertext (delivery-brief §3, ADR-002).
 * Requires the workspace to be unlocked (a cached key in IndexedDB).
 */
async function putRecord(
  userId: number,
  kind: Kind,
  record: Expense | Recurring
): Promise<void> {
  const key = await requireKey(userId)
  const plaintext = new TextEncoder().encode(JSON.stringify(record))
  const ciphertext = await encrypt(key, plaintext)
  const res = await fetch(`/api/records/${record.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ciphertext: toB64(ciphertext) }),
  })
  if (!res.ok) throw new Error('failed to save record')
}

/** Lists + decrypts all records of a kind for the current user. */
async function listRecords<T>(userId: number, kind: Kind): Promise<T[]> {
  const key = await requireKey(userId)
  const res = await fetch(`/api/records?kind=${kind}`)
  if (!res.ok) throw new Error('failed to load records')
  const { records } = await res.json()
  const out: T[] = []
  for (const r of records) {
    const plain = await decrypt(key, fromB64(r.ciphertext))
    out.push(JSON.parse(new TextDecoder().decode(plain)) as T)
  }
  return out
}

/** Removes a record by id. */
async function deleteRecord(id: string): Promise<void> {
  const res = await fetch(`/api/records/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('failed to delete record')
}

export const expenses = {
  list: (userId: number) => listRecords<Expense>(userId, 'expense'),
  save: (userId: number, e: Expense) => putRecord(userId, 'expense', e),
  remove: (id: string) => deleteRecord(id),
}

export const recurring = {
  list: (userId: number) => listRecords<Recurring>(userId, 'recurring'),
  save: (userId: number, r: Recurring) => putRecord(userId, 'recurring', r),
  remove: (id: string) => deleteRecord(id),
}

async function requireKey(userId: number): Promise<CryptoKey> {
  const key = await loadCachedKey(userId)
  if (!key) throw new Error('workspace locked')
  return key
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
