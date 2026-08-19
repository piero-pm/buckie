/**
 * Dev-only seed script (WORK-003 manual verification; updated for the
 * WORK-005 taxonomy + expectations): registers a test account on a LOCAL
 * buckie server (DEV_MODE=true so the OTP code lands in the server log),
 * sets up its vault with the same Argon2id + AES-256-GCM envelope the
 * browser would create, then PUTs ~3 months of realistic encrypted records
 * (expenses, recurring, income, expectations) through the real API.
 * Never point this at production.
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
const codes = [
  ...log.matchAll(new RegExp(`DEV sign-in code for ${EMAIL}: (\\d{6})`, 'g')),
]
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
  m: 65536,
  t: 3,
  p: 1,
  dkLen: 32,
})
const key = await crypto.subtle.importKey('raw', dk, 'AES-GCM', false, [
  'encrypt',
])
const verifier = await encrypt(key, new TextEncoder().encode('buckie-vault-v1'))
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
// Categories follow the WORK-005 16-category taxonomy. The expectations
// record is deliberately mixed vs the actuals so expected-vs-actual shows
// red (bills always over, shopping over in July) and green (groceries,
// subscriptions under) side by side; startingBalance anchors the trend.
const iso = (s) => `${s}T10:00:00.000Z`
const expense = (amount, category, date, note) => ({
  id: crypto.randomUUID(),
  amount,
  category,
  date,
  note,
  createdAt: iso(date),
})
const recurring = (amount, category, day, note) => ({
  id: crypto.randomUUID(),
  amount,
  category,
  dayOfMonth: day,
  note,
  active: true,
  createdAt: iso('2026-06-01'),
})
const income = (amount, kind, label, day) => ({
  id: crypto.randomUUID(),
  amount,
  kind,
  label,
  dayOfMonth: day,
  active: true,
  createdAt: iso('2026-06-01'),
})
const day = (d, m) => `2026-${m}-${String(d).padStart(2, '0')}`
const groceries = (d, m, a, n) => expense(a, 'Groceries', day(d, m), n)
const goingOut = (d, m, a, n) => expense(a, 'Restaurants & drinks', day(d, m), n)

const SEED = [
  // The plan (expected-vs-actual): rent spot-on, bills over, rest under.
  [
    'expectations',
    {
      id: 'expectations',
      startingBalance: 2000,
      expected: {
        rent: 850,
        bills: 120,
        groceries: 220,
        goingOut: 140,
        shopping: 90,
        subscriptions: 30,
      },
      updatedAt: iso('2026-06-01'),
    },
  ],
  ['income', income(2200, 'salary', 'Acme payroll', 27)],
  ['income', income(350, 'freelance', 'Side design work', 15)],
  ['recurring', recurring(850, 'Rent', 1)],
  ['recurring', recurring(145, 'Bills', 5)],
  ['recurring', recurring(75, 'Insurance', 10)],
  ['recurring', recurring(13.99, 'Subscriptions', 3, 'Netflix')],
  ['recurring', recurring(10.99, 'Subscriptions', 8, 'Spotify')],
  // June (one-offs ≈ €635)
  ['expense', groceries(2, '06', 42.3, 'weekly groceries')],
  ['expense', goingOut(5, '06', 18.5, 'lunch with team')],
  ['expense', groceries(9, '06', 61.2)],
  ['expense', goingOut(12, '06', 25)],
  ['expense', goingOut(16, '06', 33.75, 'dinner out')],
  ['expense', goingOut(19, '06', 12.4)],
  ['expense', groceries(23, '06', 55.6, 'groceries')],
  ['expense', goingOut(27, '06', 21.3)],
  ['expense', expense(24, 'Entertainment & culture', day(21, '06'), 'cinema')],
  ['expense', expense(45, 'Transport & Travel', day(7, '06'), 'train ticket')],
  ['expense', expense(32.5, 'Transport & Travel', day(18, '06'))],
  [
    'expense',
    expense(89.99, 'Shopping & clothes', day(11, '06'), 'summer shoes'),
  ],
  ['expense', expense(22.5, 'Health', day(14, '06'), 'pharmacy')],
  ['expense', expense(28, 'Personal care', day(20, '06'), 'haircut')],
  ['expense', expense(24.9, 'Education & books', day(24, '06'))],
  ['expense', expense(18.5, 'Pets', day(26, '06'), 'cat food')],
  ['expense', expense(19.99, 'Miscellaneous', day(28, '06'))],
  ['expense', expense(35, 'Gifts', day(30, '06'), 'birthday')],
  // July (one-offs ≈ €687)
  ['expense', groceries(3, '07', 48.9, 'groceries')],
  ['expense', goingOut(6, '07', 22.1)],
  ['expense', groceries(10, '07', 58.4)],
  ['expense', goingOut(13, '07', 31.2)],
  ['expense', goingOut(17, '07', 15.8)],
  ['expense', groceries(21, '07', 44.6, 'groceries')],
  ['expense', goingOut(24, '07', 27.9)],
  ['expense', groceries(28, '07', 38.5)],
  ['expense', goingOut(31, '07', 19.3)],
  ['expense', expense(18, 'Entertainment & culture', day(18, '07'), 'cinema')],
  ['expense', expense(29.9, 'Transport & Travel', day(4, '07'), 'fuel')],
  ['expense', expense(26.5, 'Transport & Travel', day(15, '07'))],
  ['expense', expense(21.6, 'Transport & Travel', day(22, '07'), 'bus pass')],
  [
    'expense',
    expense(129.99, 'Shopping & clothes', day(9, '07'), 'headphones'),
  ],
  ['expense', expense(41.2, 'Health', day(12, '07'), 'dentist')],
  ['expense', expense(55, 'Personal care', day(19, '07'))],
  ['expense', expense(24.9, 'Education & books', day(25, '07'))],
  ['expense', expense(33.4, 'Miscellaneous', day(29, '07'))],
  // August so far (through the 18th — mid-month, benchmark should show pace)
  ['expense', groceries(2, '08', 39.9, 'groceries')],
  ['expense', goingOut(6, '08', 17.5)],
  ['expense', groceries(9, '08', 52.3)],
  ['expense', goingOut(13, '08', 28.7, 'lunch')],
  ['expense', groceries(16, '08', 14, 'top-up shop')],
  ['expense', goingOut(17, '08', 19.8, 'dinner with friends')],
  ['expense', expense(45, 'Transport & Travel', day(8, '08'))],
  [
    'expense',
    expense(74.5, 'Shopping & clothes', day(11, '08')),
  ],
  ['expense', expense(28, 'Personal care', day(14, '08'))],
  ['expense', expense(12, 'Miscellaneous', day(15, '08'))],
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
