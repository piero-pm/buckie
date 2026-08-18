import { useState } from 'react'
import { useWorkspace } from '../hooks/useWorkspace'
import {
  hasSkippedOnboarding,
  markOnboardingSkipped,
} from '../domain/onboarding'
import CapturePage from './CapturePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import IncomePage from './IncomePage'
import DashboardPage from './DashboardPage'
import ExpectedPage from './ExpectedPage'
import HelpPage from './HelpPage'
import HubView from './HubView'
import OnboardingPage from './OnboardingPage'
import type { View } from './views'

interface Props {
  userId: number
  view: View
  onNavigate: (v: View) => void
}

/** The signed-in workspace: owns the decrypted record state (useWorkspace)
 * and routes the current view (owned by App so the persistent header shares
 * it). Onboarding shows until handled while the income register is empty
 * (TICKET-021); the hub card stays until a source exists (BR-ONB-2). */
export default function HomePage({ userId, view, onNavigate }: Props) {
  const ws = useWorkspace(userId)
  const [onboardingClosed, setOnboardingClosed] = useState(false)
  const [incomeCardHidden, setIncomeCardHidden] = useState(false)

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
        events={ws.incomeEvents}
        onSave={ws.saveIncome}
        onDelete={ws.removeIncome}
        onSaveEvent={ws.saveIncomeEvent}
        onDeleteEvent={ws.removeIncomeEvent}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'expected') {
    return (
      <ExpectedPage
        initial={ws.expectations}
        onSave={ws.saveExpectations}
        onBack={() => onNavigate('hub')}
      />
    )
  }
  if (view === 'help') {
    return (
      <HelpPage
        onBack={() => onNavigate('hub')}
        userId={userId}
        onRestored={() => void ws.reload()}
      />
    )
  }

  if (
    !onboardingClosed &&
    ws.incomes.length === 0 &&
    !hasSkippedOnboarding(userId)
  ) {
    return (
      <OnboardingPage
        sources={ws.incomes}
        onSave={ws.saveIncome}
        onSaveExpectations={ws.saveExpectations}
        onFinish={(skipped) => {
          if (skipped) markOnboardingSkipped(userId)
          setOnboardingClosed(true)
        }}
      />
    )
  }
  return (
    <HubView
      loadError={ws.loadError}
      showIncomeCard={ws.incomes.length === 0 && !incomeCardHidden}
      onHideIncomeCard={() => setIncomeCardHidden(true)}
      onNavigate={onNavigate}
    >
      <DashboardPage
        expenses={ws.expenses}
        recurring={ws.recurring}
        incomes={ws.incomes}
        incomeEvents={ws.incomeEvents}
        expectations={ws.expectations}
      />
    </HubView>
  )
}
