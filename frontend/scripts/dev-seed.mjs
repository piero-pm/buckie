/**
 * Dev-only seed script (WORK-003 manual verification): registers a test
 * account on a LOCAL buckie server (DEV_MODE=true so the OTP code lands in
 * the server log), sets up its vault with the same Argon2id + AES-256-GCM
 * envelope the browser would create, then PUTs ~3 months of realistic
 * encrypted records through the real API. Never point this at production.
 *
 * Usage (repo root): start the server first, then from frontend/:
 *   node scripts/dev-seed.mjs --log ../server.log
 */
import { argon2idAsync } from '@noble/hashes/argon2.js'
import { readFileSync } from 'node:fs'

const BASE = arg('base') ?? 'http://localhost:8080'
const EMAIL = arg('email') ?? 'test@mybuckie.app'
const PASS = arg('pass') ?? 'TestBuckie12345'
const LOG = arg('log') ?? '../server.log'

function arg(name) {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const b64 = (bytes) => Buffer.from(bytes).toString('base64')

async function encrypt(key, plaintext) {
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    plaintext
  )
  return Buffer.concat([Buffer.from(nonce), Buffer.from(ct)])
}

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
  return res
}

// --- 1. Register + sign in via the DEV_MODE code from the server log ------
await api('/api/auth/request-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL }),
})
const log = readFileSync(LOG, 'utf8')
const codes = [...log.matchAll(new RegExp(`DEV sign-in code for ${EMAIL}: (\\d{6})`, 'g'))]
const code = codes[codes.length - 1]?.[1]
if (!code) throw new Error(`no DEV code for ${EMAIL} in ${LOG}`)
const verified = await api('/api/auth/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, code }),
})
const cookie = verified.headers.get('set-cookie').split(';')[0]
const auth = { headers: { 'Content-Type': 'application/json', Cookie: cookie } }

// --- 2. Vault: mirror the browser's kdf.ts + vault.ts exactly ------------
const salt = crypto.getRandomValues(new Uint8Array(16))
const dk = await argon2idAsync(Buffer.from(PASS, 'utf8'), salt, {
  m: 65536, t: 3, p: 1, dkLen: 32,
})
const key = await crypto.subtle.importKey('raw', dk, 'AES-GCM', false, [
  'encrypt',
])
const verifier = await encrypt(
  key,
  new TextEncoder().encode('buckie-vault-v1')
)
await api('/api/vault', {
  method: 'POST',
  headers: auth.headers,
  body: JSON.stringify({
    salt: b64(salt),
    params: JSON.stringify({ m: 65536, t: 3, p: 1, dkLen: 32 }),
    verifier: b64(verifier),
  }),
})

// --- 3. Three months of realistic data (Jun-Jul-Aug 2026) -----------------
const iso = (s) => `${s}T10:00:00.000Z`
const expense = (amount, category, date, note) => ({
  id: crypto.randomUUID(), amount, category, date,
  note, createdAt: iso(date),
})
const recurring = (amount, category, day, note) => ({
  id: crypto.randomUUID(), amount, category, dayOfMonth: day,
  note, active: true, createdAt: iso('2026-06-01'),
})
const income = (amount, kind, label, day) => ({
  id: crypto.randomUUID(), amount, kind, label,
  dayOfMonth: day, active: true, createdAt: iso('2026-06-01'),
})

const food = (d, m, a, n) => expense(a, 'Food', `2026-${m}-${String(d).padStart(2, '0')}`, n)
const SEED = [
  ['income', income(2200, 'salary', 'Acme payroll', 27)],
  ['income', income(350, 'freelance', 'Side design work', 15)],
  ['recurring', recurring(850, 'Rent', 1)],
  ['recurring', recurring(145, 'Bills', 5)],
  ['recurring', recurring(75, 'Insurance', 10)],
  ['recurring', recurring(13.99, 'Entertainment & Subscriptions', 3)],
  // June (one-offs ≈ €586)
  ['expense', food(2, '06', 42.3, 'weekly groceries')],
  ['expense', food(5, '06', 18.5, 'lunch with team')],
  ['expense', food(9, '06', 61.2)],
  ['expense', food(12, '06', 25)],
  ['expense', food(16, '06', 33.75, 'dinner out')],
  ['expense', food(19, '06', 12.4)],
  ['expense', food(23, '06', 55.6, 'groceries')],
  ['expense', food(27, '06', 21.3)],
  ['expense', expense(45, 'Transport & Travel', '2026-06-07', 'train ticket')],
  ['expense', expense(32.5, 'Transport & Travel', '2026-06-18')],
  ['expense', expense(89.99, 'Shopping', '2026-06-11', 'summer shoes')],
  ['expense', expense(22.5, 'Health', '2026-06-14', 'pharmacy')],
  ['expense', expense(28, 'Personal care', '2026-06-20', 'haircut')],
  ['expense', expense(24.9, 'Education & Books', '2026-06-24')],
  ['expense', expense(18.5, 'Pets', '2026-06-26', 'cat food')],
  ['expense', expense(19.99, 'Miscellaneous', '2026-06-28')],
  ['expense', expense(35, 'Gift', '2026-06-30', 'birthday')],
  // July (one-offs ≈ €672)
  ['expense', food(3, '07', 48.9, 'groceries')],
  ['expense', food(6, '07', 22.1)],
  ['expense', food(10, '07', 58.4, 'dinner')],
  ['expense', food(13, '07', 31.2)],
  ['expense', food(17, '07', 15.8)],
  ['expense', food(21, '07', 44.6, 'groceries')],
  ['expense', food(24, '07', 27.9)],
  ['expense', food(28, '07', 38.5)],
  ['expense', food(31, '07', 19.3)],
  ['expense', expense(29.9, 'Transport & Travel', '2026-07-04', 'fuel')],
  ['expense', expense(26.5, 'Transport & Travel', '2026-07-15')],
  ['expense', expense(21.6, 'Transport & Travel', '2026-07-22', 'bus pass')],
  ['expense', expense(129.99, 'Shopping', '2026-07-09', 'headphones')],
  ['expense', expense(41.2, 'Health', '2026-07-12', 'dentist')],
  ['expense', expense(55, 'Personal care', '2026-07-19')],
  ['expense', expense(24.9, 'Education & Books', '2026-07-25')],
  ['expense', expense(33.4, 'Miscellaneous', '2026-07-29')],
  // August so far (through the 16th — mid-month, benchmark should show pace)
  ['expense', food(2, '08', 39.9, 'groceries')],
  ['expense', food(6, '08', 17.5)],
  ['expense', food(9, '08', 52.3)],
  ['expense', food(13, '08', 28.7, 'lunch')],
  ['expense', food(16, '08', 14)],
  ['expense', expense(45, 'Transport & Travel', '2026-08-08')],
  ['expense', expense(74.5, 'Shopping', '2026-08-11')],
  ['expense', expense(28, 'Personal care', '2026-08-14')],
  ['expense', expense(12, 'Miscellaneous', '2026-08-15')],
]

// --- 4. Store everything through the real encrypted channel ---------------
let n = 0
for (const [kind, record] of SEED) {
  const ciphertext = await encrypt(
    key,
    new TextEncoder().encode(JSON.stringify(record))
  )
  await api(`/api/records/${record.id}`, {
    method: 'PUT',
    headers: auth.headers,
    body: JSON.stringify({ kind, ciphertext: b64(ciphertext) }),
  })
  n++
}

console.log(
  `Seeded ${n} records for ${EMAIL} (passphrase "${PASS}") at ${BASE}` +
    ` — log in and check the dashboards.`
)
