import { encrypt, decrypt, loadCachedKey } from '../crypto'
import type { Expectations } from '../domain/expectations'
import type { Expense, Recurring } from '../domain/expense'
import type { IncomeSource } from '../domain/income'

/** Record kinds the server stores (records table `kind` column). */
type Kind = 'expense' | 'recurring' | 'income' | 'expectations'

/**
 * Encrypts a domain record with the user's cached key and stores it on the
 * server. The server receives only ciphertext (delivery-brief §3, ADR-002).
 * Requires the workspace to be unlocked (a cached key in IndexedDB).
 */
async function putRecord(
  userId: number,
  kind: Kind,
  record: Expense | Recurring | IncomeSource | Expectations
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

/** Raw (undecrypted) record view — base64 ciphertext exactly as served. */
export interface RawRecord {
  id: string
  kind: Kind
  ciphertext: string
}

/** Lists ciphertext records of one kind — no key required (BR-EXP-1). */
async function listRaw(kind: Kind): Promise<RawRecord[]> {
  const res = await fetch(`/api/records?kind=${kind}`)
  if (!res.ok) throw new Error('failed to load records')
  const { records } = await res.json()
  return (records as { id: string; ciphertext: string }[]).map((r) => ({
    ...r,
    kind,
  }))
}

/** Stores a ciphertext record verbatim — import replay (BR-IMP-3/4). */
async function putRaw(r: RawRecord): Promise<void> {
  const res = await fetch(`/api/records/${r.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: r.kind, ciphertext: r.ciphertext }),
  })
  if (!res.ok) throw new Error('failed to save record')
}

/** Raw-record API for backup export/import; payloads stay server-blind. */
export const raw = {
  listAll: async (): Promise<RawRecord[]> => {
    const kinds: Kind[] = ['expense', 'recurring', 'income']
    const lists = await Promise.all(kinds.map((k) => listRaw(k)))
    return lists.flat()
  },
  put: putRaw,
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

export const incomes = {
  list: (userId: number) => listRecords<IncomeSource>(userId, 'income'),
  save: (userId: number, s: IncomeSource) => putRecord(userId, 'income', s),
  remove: (id: string) => deleteRecord(id),
}

export const expectationsApi = {
  list: (userId: number) => listRecords<Expectations>(userId, 'expectations'),
  save: (userId: number, x: Expectations) =>
    putRecord(userId, 'expectations', x),
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
