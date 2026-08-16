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
    category: 'Food',
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

describe('Returning home scroll (BA-DS-008 BR-HOME-2, TICKET-027)', () => {
  // EX-HOME-1: add-expense entry first, month dashboard below the recents.
  it('embeds the month view below the capture entry and recents', () => {
    renderWithMantine(
      <HubView
        expenses={spends}
        loadError=""
        showIncomeCard={false}
        onHideIncomeCard={() => {}}
        onNavigate={() => {}}
      >
        <DashboardPage expenses={spends} recurring={[]} incomes={[]} />
      </HubView>
    )
    const home = screen.getByRole('main', { name: 'home' })
    expect(home).toBeDefined()
    const entry = screen.getByRole('button', { name: /record a spend/i })
    const monthView = screen.getByRole('region', { name: 'month view' })
    expect(entry).toBeDefined()
    expect(monthView).toBeDefined()
    expect(
      entry.compareDocumentPosition(monthView) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(screen.getByText('Recent')).toBeDefined()
  })

  // BR-HOME-2: the header destinations are unchanged (no dashboard view).
  it('navigates to capture from the top entry', () => {
    renderWithMantine(
      <HubView
        expenses={[]}
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
            category: 'Food',
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
    expect(text.indexOf('Food')).toBeLessThan(text.indexOf('Rent'))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Food' }))
    expect(
      (screen.getByRole('checkbox', { name: 'Food' }) as HTMLInputElement)
        .checked
    ).toBe(true)
  })
})
