import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CodePage from './pages/CodePage'
import HomePage from './pages/HomePage'
import PassphraseSetupPage from './pages/PassphraseSetupPage'
import PassphraseUnlockPage from './pages/PassphraseUnlockPage'
import { getVault } from './api/vault'
import { loadCachedKey } from './crypto'
import { signOut as signOutApi } from './api/auth'

type Page =
  | 'landing'
  | 'login'
  | 'code'
  | 'checking'
  | 'passphrase-setup'
  | 'passphrase-unlock'
  | 'home'

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<number | null>(null)

  // On load: if already authed, resolve vault + cached key to pick the page.
  // Unauthenticated users stay on the landing page.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return
        const { user_id } = await r.json()
        setUserId(user_id)
        await routeAfterAuth(user_id, setPage)
      })
      .catch(() => undefined)
  }, [])

  if (page === 'home' && userId) {
    return (
      <HomePage
        userId={userId}
        onSignOut={async () => {
          await signOutApi()
          setUserId(null)
          setPage('landing')
        }}
      />
    )
  }
  if (page === 'passphrase-setup' && userId) {
    return (
      <PassphraseSetupPage userId={userId} onUnlocked={() => setPage('home')} />
    )
  }
  if (page === 'passphrase-unlock' && userId) {
    return (
      <PassphraseUnlockPage
        userId={userId}
        onUnlocked={() => setPage('home')}
      />
    )
  }
  if (page === 'checking') {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}
      >
        <span aria-label="loading">Loading…</span>
      </div>
    )
  }
  if (page === 'code') {
    return (
      <CodePage
        email={email}
        onSuccess={async () => {
          // After sign-in, route by vault status + cached key (EX-PASS-3/4).
          const r = await fetch('/api/auth/me')
          const { user_id } = await r.json()
          setUserId(user_id)
          await routeAfterAuth(user_id, setPage)
        }}
      />
    )
  }
  if (page === 'login') {
    return (
      <LoginPage
        onCodeSent={(e) => {
          setEmail(e)
          setPage('code')
        }}
        onBack={() => setPage('landing')}
      />
    )
  }
  return <LandingPage onAccess={() => setPage('login')} />
}

// routeAfterAuth picks the post-login page from vault status + cached key:
//  no vault            -> setup
//  vault + cached key  -> home (same-device no re-entry, EX-PASS-3)
//  vault + no key      -> unlock (new device / cleared cache, EX-PASS-4)
async function routeAfterAuth(userId: number, setPage: (p: Page) => void) {
  setPage('checking')
  try {
    const status = await getVault()
    if (!status.hasPassphrase) {
      setPage('passphrase-setup')
      return
    }
    const cached = await loadCachedKey(userId)
    setPage(cached ? 'home' : 'passphrase-unlock')
  } catch {
    setPage('home') // vault check failed: fall back to home (no data stored yet)
  }
}
