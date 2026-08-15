import { useEffect, useState } from 'react'
import {
  expenses as expenseApi,
  recurring as recurringApi,
} from '../api/records'
import type { Expense, Recurring } from '../domain/expense'
import CapturePage from './CapturePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import DashboardPage from './DashboardPage'
import HelpPage from './HelpPage'
import HubView from './HubView'
import type { View } from './views'

interface Props {
  userId: number
  view: View
  onNavigate: (v: View) => void
}

/** The signed-in workspace: loads + caches decrypted records once and routes
 * the current view (owned by App so the persistent header shares it). Data
 * is mutated in place, so sub-pages see updates immediately. */
export default function HomePage({ userId, view, onNavigate }: Props) {
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

  if (view === 'capture') {
    return (
      <CapturePage
        existing={expenses}
        onSave={async (e) => {
          await expenseApi.save(userId, e)
          setExpenses((prev) => [e, ...prev])
        }}
        onBack={() => onNavigate('hub')}
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
        onBack={() => onNavigate('hub')}
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
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'dashboard') {
    return (
      <DashboardPage
        expenses={expenses}
        recurring={recurring}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'help') {
    return <HelpPage onBack={() => onNavigate('hub')} />
  }
  return (
    <HubView
      expenses={expenses}
      loadError={loadError}
      onNavigate={onNavigate}
    />
  )
}
