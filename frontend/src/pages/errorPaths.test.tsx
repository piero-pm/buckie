import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CodePage from './CodePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import IncomePage from './IncomePage'
import { theme } from '../theme'
import type { Expense, Recurring } from '../domain/expense'
import type { IncomeSource } from '../domain/income'

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications />
      {ui}
    </MantineProvider>
  )
}

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const okSent = {
  ok: true,
  json: async () => ({ message: 'a code was sent' }),
}

const expense: Expense = {
  id: 'e1',
  amount: 12.5,
  category: 'Groceries',
  date: '2026-08-01',
  createdAt: '2026-08-01T10:00:00.000Z',
}
const recurring: Recurring = {
  id: 'r1',
  amount: 50,
  category: 'Bills',
  dayOfMonth: 1,
  active: true,
  createdAt: '2026-08-01T10:00:00.000Z',
}
const income: IncomeSource = {
  id: 'i1',
  amount: 2000,
  kind: 'salary',
  active: true,
  createdAt: '2026-08-01T10:00:00.000Z',
}

describe('Code page honest errors (BA-DS-007, TICKET-024)', () => {
  beforeEach(() => mockFetch.mockReset())

  // EX-RL-3: a throttled resend surfaces the truthful server message.
  it('shows the truthful throttle message on a 429 resend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'too many codes requested — try again within the hour',
      }),
    })
    renderWithMantine(
      <CodePage email="a@b.c" onSuccess={() => {}} onChangeEmail={() => {}} />
    )
    fireEvent.click(screen.getByRole('button', { name: /resend code/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(
        /too many codes requested/i
      )
    })
  })

  // EX-ERR-3: resend requests a fresh code and cools down for 60 s.
  it('resends a code and shows the countdown', async () => {
    mockFetch.mockResolvedValueOnce(okSent)
    renderWithMantine(
      <CodePage email="a@b.c" onSuccess={() => {}} onChangeEmail={() => {}} />
    )
    fireEvent.click(screen.getByRole('button', { name: /^resend code$/i }))
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/request-code',
      expect.objectContaining({ method: 'POST' })
    )
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toMatch(
        /a new code is on its way/i
      )
    })
    expect(
      screen.getByRole('button', { name: /resend code in 60s/i })
    ).toBeDisabled()
  })

  // BR-ERR-3: a path back to change the email address.
  it('offers use a different email via the provided callback', () => {
    const onChangeEmail = vi.fn()
    renderWithMantine(
      <CodePage
        email="a@b.c"
        onSuccess={() => {}}
        onChangeEmail={onChangeEmail}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /different email/i }))
    expect(onChangeEmail).toHaveBeenCalled()
  })
})

describe('Mutation failures are visible (BR-ERR-4, TICKET-025)', () => {
  beforeEach(() => mockFetch.mockReset())

  // EX-ERR-2 family: a failed delete keeps the row and shows a toast.
  it('shows a toast when an expense delete fails', async () => {
    renderWithMantine(
      <ExpensesPage
        expenses={[expense]}
        onUpdate={vi.fn(async () => {})}
        onDelete={vi.fn(async () => {
          throw new Error('offline')
        })}
        onBack={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'delete' }))
    await waitFor(() => {
      expect(screen.getByText(/could not delete — try again/i)).toBeDefined()
    })
    expect(screen.getByText('Groceries')).toBeDefined() // row remains
  })

  it('shows a toast when ending a recurring item fails', async () => {
    renderWithMantine(
      <RecurringPage
        items={[recurring]}
        onSave={vi.fn(async () => {
          throw new Error('offline')
        })}
        onDelete={vi.fn(async () => {})}
        onBack={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'end' }))
    await waitFor(() => {
      expect(screen.getByText(/could not end — try again/i)).toBeDefined()
    })
  })

  it('shows a toast when ending an income source fails', async () => {
    renderWithMantine(
      <IncomePage
        items={[income]}
        events={[]}
        onSave={vi.fn(async () => {
          throw new Error('offline')
        })}
        onDelete={vi.fn(async () => {})}
        onSaveEvent={vi.fn(async () => {})}
        onDeleteEvent={vi.fn(async () => {})}
        onBack={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'end' }))
    await waitFor(() => {
      expect(screen.getByText(/could not end — try again/i)).toBeDefined()
    })
  })

  it('shows an inline error when saving an edit fails', async () => {
    renderWithMantine(
      <ExpensesPage
        expenses={[expense]}
        onUpdate={vi.fn(async () => {
          throw new Error('offline')
        })}
        onDelete={vi.fn(async () => {})}
        onBack={() => {}}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    // The notifications store is module-global: stale toasts from earlier
    // tests can satisfy the role query first, so retry until our text shows.
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(
        alerts.some((a) =>
          /could not save\. try again\./i.test(a.textContent ?? '')
        )
      ).toBe(true)
    })
  })
})
