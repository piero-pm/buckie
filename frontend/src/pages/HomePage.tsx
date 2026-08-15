import { useWorkspace } from '../hooks/useWorkspace'
import CapturePage from './CapturePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import IncomePage from './IncomePage'
import DashboardPage from './DashboardPage'
import HelpPage from './HelpPage'
import HubView from './HubView'
import type { View } from './views'

interface Props {
  userId: number
  view: View
  onNavigate: (v: View) => void
}

/** The signed-in workspace: owns the decrypted record state (useWorkspace)
 * and routes the current view (owned by App so the persistent header shares
 * it). Data is mutated in place, so sub-pages see updates immediately. */
export default function HomePage({ userId, view, onNavigate }: Props) {
  const ws = useWorkspace(userId)

  if (view === 'capture') {
    return (
      <CapturePage
        existing={ws.expenses}
        onSave={ws.saveExpense}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'expenses') {
    return (
      <ExpensesPage
        expenses={ws.expenses}
        onUpdate={ws.updateExpense}
        onDelete={ws.removeExpense}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'recurring') {
    return (
      <RecurringPage
        items={ws.recurring}
        onSave={ws.saveRecurring}
        onDelete={ws.removeRecurring}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'income') {
    return (
      <IncomePage
        items={ws.incomes}
        onSave={ws.saveIncome}
        onDelete={ws.removeIncome}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'dashboard') {
    return (
      <DashboardPage
        expenses={ws.expenses}
        recurring={ws.recurring}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'help') {
    return <HelpPage onBack={() => onNavigate('hub')} />
  }
  return (
    <HubView
      expenses={ws.expenses}
      loadError={ws.loadError}
      onNavigate={onNavigate}
    />
  )
}
