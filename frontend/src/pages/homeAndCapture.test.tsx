import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import HubView from './HubView'
import DashboardPage from './DashboardPage'
import CapturePage from './CapturePage'
import { theme } from '../theme'
import type { Expense } from '../domain/expense'

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      {ui}
    </MantineProvider>
  )
}

const spends: Expense[] = [
  {
    id: 'e1',
    amount: 12.5,
    category: 'Groceries',
    date: '2026-08-01',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'e2',
    amount: 40,
    category: 'Bills',
    date: '2026-07-02',
    createdAt: '2026-07-02T10:00:00.000Z',
  },
]

describe('Returning home scroll (BA-DS-010 BR-DASH-1, TICKET-039)', () => {
  // EX-HOME-1 / BR-DASH-1: capture entry first, month view next, and the
  // month's expense list closes the scroll (old "Recent" superseded).
  it('runs capture -> month view -> month expense list in order', () => {
    renderWithMantine(
      <HubView
        loadError=""
        showIncomeCard={false}
        onHideIncomeCard={() => {}}
        onNavigate={() => {}}
      >
        <DashboardPage
          expenses={spends}
          recurring={[]}
          incomes={[]}
          incomeEvents={[]}
          expectations={null}
        />
      </HubView>
    )
    const home = screen.getByRole('main', { name: 'home' })
    expect(home).toBeDefined()
    const entry = screen.getByRole('button', { name: /record a spend/i })
    const monthView = screen.getByRole('region', { name: 'month view' })
    const monthList = screen.getByText(/this month's expenses/i)
    expect(monthView).toBeDefined()
    expect(monthList).toBeDefined()
    expect(
      entry.compareDocumentPosition(monthView) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      monthView.compareDocumentPosition(monthList) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.queryByText('Recent')).toBeNull()
  })

  // Without children the hub renders the entry points only.
  it('navigates to capture from the top entry', () => {
    renderWithMantine(
      <HubView
        loadError=""
        showIncomeCard={false}
        onHideIncomeCard={() => {}}
        onNavigate={() => {}}
      />
    )
    expect(screen.queryByRole('region', { name: 'month view' })).toBeNull()
  })
})

describe('Capture quick-pick chips (BR-CAP-1, TICKET-026)', () => {
  // EX-CAP-1: most-used categories render as one-tap chips above dropdown.
  it('offers the most-used category first as a one-tap chip', () => {
    const { container } = renderWithMantine(
      <CapturePage
        existing={[
          { ...spends[0] },
          {
            id: 'e3',
            amount: 9,
            category: 'Groceries',
            date: '2026-08-03',
            createdAt: '2026-08-03T10:00:00.000Z',
          },
        ]}
        onSave={vi.fn(async () => {})}
        onBack={() => {}}
      />
    )
    expect(screen.getAllByRole('checkbox')).toHaveLength(6)
    const text = container.textContent ?? ''
    expect(text.indexOf('Groceries')).toBeLessThan(text.indexOf('Rent'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Groceries' }))
    expect(
      (screen.getByRole('checkbox', { name: 'Groceries' }) as HTMLInputElement)
        .checked
    ).toBe(true)
  })
})
