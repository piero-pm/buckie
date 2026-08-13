/**
 * Caches a user's non-extractable CryptoKey so the passphrase is re-entered
 * only on a new device or after cache eviction (ADR-002/003; EX-PASS-3/4).
 *
 * Two layers:
 *  - an in-process cache (one key per user id) for instant access;
 *  - IndexedDB persistence so a page reload on the SAME device unlocks without
 *    re-entry. Non-extractable CryptoKeys survive structured clone, so the key
 *    can be stored and re-read without ever being exportable.
 *
 * The key is never written anywhere it could be extracted.
 */
const DB_NAME = 'buckie'
const STORE = 'keys'

let cache: { userId: number; key: CryptoKey } | null = null

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function dbGet(userId: number): Promise<CryptoKey | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(userId)
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined)
    req.onerror = () => reject(req.error)
    db.close()
  })
}

async function dbPut(userId: number, key: CryptoKey): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(key, userId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    db.close()
  })
}

async function dbDelete(userId: number): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(userId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    db.close()
  })
}

/** Records a freshly derived key in both cache and IndexedDB. */
export async function cacheKey(userId: number, key: CryptoKey): Promise<void> {
  cache = { userId, key }
  await dbPut(userId, key)
}

/** True only if a key for this user is already in the in-process cache. */
export function hasCachedKey(userId: number): boolean {
  return cache !== null && cache.userId === userId
}

/**
 * Loads the persisted key for this user, if any. On a same-device reload the
 * key is still in IndexedDB and is returned; on a new device there is nothing.
 */
export async function loadCachedKey(
  userId: number
): Promise<CryptoKey | undefined> {
  if (hasCachedKey(userId)) return cache!.key
  const key = await dbGet(userId)
  if (key) cache = { userId, key }
  return key
}

/** Drops both the cache and any persisted key (used on sign-out / lock). */
export async function clearKey(userId: number): Promise<void> {
  if (cache?.userId === userId) cache = null
  await dbDelete(userId)
}
