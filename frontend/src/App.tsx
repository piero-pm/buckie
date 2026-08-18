import { useState, useEffect, useRef } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CodePage from './pages/CodePage'
import HomePage from './pages/HomePage'
import PassphraseSetupPage from './pages/PassphraseSetupPage'
import PassphraseUnlockPage from './pages/PassphraseUnlockPage'
import AppHeader from './components/AppHeader'
import { VIEW_PATHS, viewFromPath } from './pages/routes'
import { routeAfterAuth, type From } from './pages/authRouting'
import { clearKey } from './crypto'
import { signOut as signOutApi } from './api/auth'

/** Auth phase for the URL the user is on (BR-ROUTE-1, WORK-007). */
export default function App() {
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [booting, setBooting] = useState(true)
  const signingOut = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as From | null)?.from

  // On load: if already authed, resolve vault + cached key; a locked user
  // deep-linking or refreshing a workspace route is sent to unlock with the
  // target preserved (EX-NU-3). Unauthenticated users stay on landing.
  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!r.ok) return
        const { user_id } = await r.json()
        setUserId(user_id)
        signingOut.current = false
        const initial = viewFromPath(location.pathname)
          ? location.pathname
          : '/home'
        await routeAfterAuth(user_id, initial, navigate)
      })
      .catch(() => undefined)
      .finally(() => setBooting(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignOut() {
    // BR-LOCK-1: signing out locks the space — the cached key leaves the
    // device before the session ends, so re-entry needs the passphrase.
    // The ref suppresses the workspace login-redirect during the transition
    // (setUserId and the navigation may flush in separate renders).
    signingOut.current = true
    if (userId) await clearKey(userId)
    await signOutApi()
    navigate('/')
    setUserId(null)
  }

  const workspace = viewFromPath(location.pathname) !== null
  const authedShell = (child: React.ReactNode) => (
    <>
      <AppHeader
        authed
        active={viewFromPath(location.pathname) ?? 'hub'}
        onNavigate={(v) => navigate(VIEW_PATHS[v])}
        onSignOut={handleSignOut}
      />
      {child}
    </>
  )

  if (booting && !userId) return <Loading />
  if (workspace && !userId) {
    if (signingOut.current) return <Loading />
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <AppHeader
              authed={false}
              onLogin={() => navigate('/login', { state: { from } })}
            />
            <LandingPage
              onAccess={() => navigate('/login', { state: { from } })}
            />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <AppHeader authed={false} />
            <LoginPage
              onCodeSent={(e) => {
                setEmail(e)
                navigate('/code', { state: { from } })
              }}
              onBack={() => navigate('/')}
            />
          </>
        }
      />
      <Route
        path="/code"
        element={
          <>
            <AppHeader authed={false} />
            <CodePage
              email={email}
              onSuccess={async () => {
                // After sign-in, route by vault status + cached key
                // (EX-PASS-3/4), preserving the deep-link target (EX-NU-1).
                const r = await fetch('/api/auth/me')
                const { user_id } = await r.json()
                setUserId(user_id)
                signingOut.current = false
                await routeAfterAuth(user_id, from ?? '/home', navigate, from)
              }}
              onChangeEmail={() => navigate('/login', { state: { from } })}
            />
          </>
        }
      />
      <Route
        path="/passphrase-setup"
        element={
          userId ? (
            <>
              <AppHeader authed={false} />
              <PassphraseSetupPage
                userId={userId}
                onUnlocked={() => navigate(from ?? '/home')}
                onRestored={() =>
                  navigate('/passphrase-unlock', { state: { from } })
                }
              />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/passphrase-unlock"
        element={
          userId ? (
            <>
              <AppHeader authed={false} />
              <PassphraseUnlockPage
                userId={userId}
                onUnlocked={() => navigate(from ?? '/home')}
              />
            </>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      {(Object.keys(VIEW_PATHS) as (keyof typeof VIEW_PATHS)[]).map((v) => (
        <Route
          key={v}
          path={VIEW_PATHS[v]}
          element={authedShell(
            <HomePage
              userId={userId!}
              view={viewFromPath(location.pathname) ?? 'hub'}
              onNavigate={(target) => navigate(VIEW_PATHS[target])}
            />
          )}
        />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <span aria-label="loading">Loading…</span>
    </div>
  )
}

// routeAfterAuth lives in pages/authRouting.ts (clean-artifacts sizes).
