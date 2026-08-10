import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import CodePage from './pages/CodePage'
import HomePage from './pages/HomePage'

type Page = 'login' | 'code' | 'home'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (r.ok) setPage('home')
      })
      .catch(() => undefined)
  }, [])

  if (page === 'home') return <HomePage onSignOut={() => setPage('login')} />
  if (page === 'code')
    return <CodePage email={email} onSuccess={() => setPage('home')} />
  return (
    <LoginPage
      onCodeSent={(e) => {
        setEmail(e)
        setPage('code')
      }}
    />
  )
}
