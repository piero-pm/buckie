import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import App from './App'
import { theme } from './theme'

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      {ui}
    </MantineProvider>
  )
}

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const meOk = { ok: true, json: async () => ({ user_id: 1 }) }
const me401 = { ok: false, json: async () => ({}) }
const codeSent = {
  ok: true,
  json: async () => ({ message: 'a code was sent' }),
}
const signedIn = { ok: true, json: async () => ({ message: 'signed in' }) }
const badCode = {
  ok: false,
  json: async () => ({ error: 'invalid or expired code' }),
}
const vaultNone = { ok: true, json: async () => ({ hasPassphrase: false }) }

// Helper: queue the fetch responses for the post-verify routing sequence:
//   /api/auth/me -> meOk, /api/vault -> vaultNone (no passphrase set).
function queuePostVerifyToSetup() {
  mockFetch.mockResolvedValueOnce(meOk).mockResolvedValueOnce(vaultNone)
}

describe('Landing + login + vault routing', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  // Unauthenticated users land on the public landing page (not login).
  it('shows the landing page when not authenticated', async () => {
    mockFetch.mockResolvedValueOnce(me401)
    renderWithMantine(<App />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /access your space/i })
      ).toBeDefined()
    })
  })

  // Landing CTA routes into the login form.
  it('routes from landing to login on CTA click', async () => {
    mockFetch.mockResolvedValueOnce(me401)
    renderWithMantine(<App />)
    await waitFor(() =>
      screen.getByRole('button', { name: /access your space/i })
    )
    fireEvent.click(screen.getByRole('button', { name: /access your space/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDefined()
    })
  })

  it('routes authed users with a cached key straight to home', async () => {
    // me ok -> vault has passphrase -> IndexedDB empty => unlock page, NOT home.
    // To prove same-device no-re-entry (EX-PASS-3) we seed a cached key first.
    mockFetch
      .mockResolvedValueOnce(meOk)
      .mockResolvedValueOnce(vaultWithPassphrase)
    await seedCachedKey(1)
    renderWithMantine(<App />)
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeDefined()
    })
  })

  it('advances to code entry after email submission', async () => {
    mockFetch.mockResolvedValueOnce(me401).mockResolvedValueOnce(codeSent)
    renderWithMantine(<App />)
    await openLoginFromLanding()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/6-digit/i)).toBeDefined()
    })
  })

  it('routes to passphrase setup after first correct code (no vault yet)', async () => {
    mockFetch
      .mockResolvedValueOnce(me401) // initial me
      .mockResolvedValueOnce(codeSent) // request-code
      .mockResolvedValueOnce(signedIn) // verify-code
    queuePostVerifyToSetup() // me + vault after verify
    renderWithMantine(<App />)
    await openLoginFromLanding()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => screen.getByPlaceholderText(/6-digit/i))
    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: '123456' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /enter code/i }))
    await waitFor(() => {
      expect(
        screen.getByRole('form', { name: /set up passphrase/i })
      ).toBeDefined()
    })
  })

  it('shows error and stays on code page for wrong code (gate)', async () => {
    mockFetch
      .mockResolvedValueOnce(me401)
      .mockResolvedValueOnce(codeSent)
      .mockResolvedValueOnce(badCode)
    renderWithMantine(<App />)
    await openLoginFromLanding()
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => screen.getByPlaceholderText(/6-digit/i))
    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: '000000' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /enter code/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
    })
    expect(screen.queryByRole('main')).toBeNull()
  })
})

// Helper: click the landing CTA and wait for the login form to appear.
async function openLoginFromLanding() {
  await waitFor(() =>
    screen.getByRole('button', { name: /access your space/i })
  )
  fireEvent.click(screen.getByRole('button', { name: /access your space/i }))
  await waitFor(() => screen.getByLabelText(/email/i))
}

const vaultWithPassphrase = {
  ok: true,
  json: async () => ({
    hasPassphrase: true,
    salt: 'c2FsdA==',
    params: '{"m":1024,"t":1,"p":1,"dkLen":32}',
    verifier: 'dmVyaWZpZXI=',
  }),
}

const emptyRecords = { ok: true, json: async () => ({ records: [] }) }
const signOutOk = { ok: true, json: async () => ({ message: 'signed out' }) }

describe('Persistent header (BA-DS-005)', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  // EX-NAV-1: signed-out screens show brand + Log in in the header.
  it('shows header Log in when signed out', async () => {
    mockFetch.mockResolvedValueOnce(me401)
    renderWithMantine(<App />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^log in$/i })).toBeDefined()
    })
  })

  // EX-NAV-1: header Log in opens the email-code login flow.
  it('opens the login flow from the header', async () => {
    mockFetch.mockResolvedValueOnce(me401)
    renderWithMantine(<App />)
    await waitFor(() => screen.getByRole('button', { name: /^log in$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDefined()
    })
  })

  // EX-NAV-2: destinations switch views; sign-out returns to the landing.
  it('switches views and signs out from the header', async () => {
    mockFetch
      .mockResolvedValueOnce(meOk)
      .mockResolvedValueOnce(vaultWithPassphrase)
      .mockResolvedValueOnce(emptyRecords) // expenses list
      .mockResolvedValueOnce(emptyRecords) // recurring list
      .mockResolvedValueOnce(emptyRecords) // incomes list
      .mockResolvedValueOnce(signOutOk) // sign out
    await seedCachedKey(1)
    renderWithMantine(<App />)
    await waitFor(() => screen.getByRole('main', { name: 'home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    await waitFor(() => {
      expect(screen.getByRole('main', { name: 'help' })).toBeDefined()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Income' }))
    await waitFor(() => {
      expect(screen.getByRole('main', { name: 'income sources' })).toBeDefined()
    })
    fireEvent.click(screen.getByRole('button', { name: 'sign out' }))
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /access your space/i })
      ).toBeDefined()
    })
  })
})

// Seed a non-extractable key into IndexedDB for user 1 so routeAfterAuth's
// loadCachedKey finds it and routes to home (EX-PASS-3 same-device).
async function seedCachedKey(userId: number) {
  const key = await crypto.subtle.importKey(
    'raw',
    crypto.getRandomValues(new Uint8Array(32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
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
}
