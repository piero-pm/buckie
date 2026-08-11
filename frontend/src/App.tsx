import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import CodePage from './pages/CodePage'
import HomePage from './pages/HomePage'
import PassphraseSetupPage from './pages/PassphraseSetupPage'
import PassphraseUnlockPage from './pages/PassphraseUnlockPage'
import { getVault } from './api/vault'
import { loadCachedKey } from './crypto'
import { signOut as signOutApi } from './api/auth'

type Page =
  | 'login'
  | 'code'
  | 'checking'
  | 'passphrase-setup'
  | 'passphrase-unlock'
  | 'home'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<number | null>(null)

  // On load: if already authed, resolve vault + cached key to pick the page.
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

  if (page === 'home') {
    return (
      <HomePage
        onSignOut={async () => {
          await signOutApi()
          setUserId(null)
          setPage('login')
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
  if (page === 'checking') return <p aria-label="loading">Loading…</p>
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
  return (
    <LoginPage
      onCodeSent={(e) => {
        setEmail(e)
        setPage('code')
      }}
    />
  )
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
