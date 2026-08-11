import { useEffect, useState } from 'react'
import {
  expenses as expenseApi,
  recurring as recurringApi,
} from '../api/records'
import { signOut as signOutApi } from '../api/auth'
import type { Expense, Recurring } from '../domain/expense'
import { formatEUR } from '../domain/taxonomy'
import CapturePage from './CapturePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import DashboardPage from './DashboardPage'

type View = 'hub' | 'capture' | 'expenses' | 'recurring' | 'dashboard'

interface Props {
  userId: number
  onSignOut: () => void
}

/** The signed-in home: a small hub that loads + caches decrypted records and
 * routes to capture / review / recurring / dashboard. Data is fetched once and
 * mutated in place, so sub-pages see updates immediately. */
export default function HomePage({ userId, onSignOut }: Props) {
  const [view, setView] = useState<View>('hub')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [loadError, setLoadError] = useState('')

  async function load() {
    setLoadError('')
    try {
      const [e, r] = await Promise.all([
        expenseApi.list(userId),
        recurringApi.list(userId),
      ])
      setExpenses(e)
      setRecurring(r)
    } catch {
      setLoadError('Could not load your data. Try unlocking again.')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function handleSignOut() {
    await signOutApi()
    onSignOut()
  }

  if (view === 'capture') {
    return (
      <CapturePage
        existing={expenses}
        onSave={async (e) => {
          await expenseApi.save(userId, e)
          setExpenses((prev) => [e, ...prev])
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'expenses') {
    return (
      <ExpensesPage
        expenses={expenses}
        onUpdate={async (e) => {
          await expenseApi.save(userId, e)
          setExpenses((prev) => prev.map((x) => (x.id === e.id ? e : x)))
        }}
        onDelete={async (id) => {
          await expenseApi.remove(id)
          setExpenses((prev) => prev.filter((x) => x.id !== id))
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'recurring') {
    return (
      <RecurringPage
        items={recurring}
        onSave={async (r) => {
          await recurringApi.save(userId, r)
          setRecurring((prev) => {
            const i = prev.findIndex((x) => x.id === r.id)
            return i >= 0
              ? prev.map((x) => (x.id === r.id ? r : x))
              : [r, ...prev]
          })
        }}
        onDelete={async (id) => {
          await recurringApi.remove(id)
          setRecurring((prev) => prev.filter((x) => x.id !== id))
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'dashboard') {
    return (
      <DashboardPage
        expenses={expenses}
        recurring={recurring}
        onBack={() => setView('hub')}
      />
    )
  }

  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
  return (
    <main aria-label="home">
      <h1>Penny Saver</h1>
      {loadError && <p role="alert">{loadError}</p>}
      <nav>
        <button onClick={() => setView('capture')}>Record a spend</button>
        <button onClick={() => setView('expenses')}>Recent expenses</button>
        <button onClick={() => setView('recurring')}>Recurring</button>
        <button onClick={() => setView('dashboard')}>Dashboard</button>
      </nav>
      <h2>Recent</h2>
      <ul>
        {recent.map((e) => (
          <li key={e.id}>
            {formatEUR(e.amount)} — {e.category} — {e.date}
          </li>
        ))}
        {recent.length === 0 && (
          <li>No expenses yet. Record your first spend.</li>
        )}
      </ul>
      <button onClick={handleSignOut}>Sign out</button>
    </main>
  )
}
