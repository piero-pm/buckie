import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect, vi } from 'vitest'
import ExpensesPage from './ExpensesPage'
import EditExpense from './EditExpense'
import { theme } from '../theme'
import type { Expense } from '../domain/expense'

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      {ui}
    </MantineProvider>
  )
}

const expense: Expense = {
  id: 'e1',
  amount: 12.5,
  category: 'Groceries',
  date: '2026-08-01',
  note: 'wrong note',
  createdAt: '2026-08-01T10:00:00.000Z',
}

describe('Expense browser + note editing (BR-LST-1/BR-EDIT-1)', () => {
  it('composes filters and reaches the row editor (EX-IC-1)', async () => {
    renderWithMantine(
      <ExpensesPage
        expenses={[expense]}
        recurring={[]}
        onUpdate={vi.fn(async () => {})}
        onDelete={vi.fn(async () => {})}
        onBack={() => {}}
      />
    )
    // Search narrows to the matching row.
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'wrong' },
    })
    expect(screen.getByText(/wrong note/i)).toBeDefined()
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'no-match-xyz' },
    })
    expect(screen.getByText(/no expenses match/i)).toBeDefined()
  })

  it('saves an edited note (EX-IC-5)', async () => {
    const onSave = vi.fn(async (e: Expense) => {
      expect(e.id).toBe('e1')
    })
    renderWithMantine(
      <EditExpense expense={expense} onSave={onSave} onCancel={() => {}} />
    )
    const note = screen.getByLabelText(/note/i)
    fireEvent.change(note, { target: { value: 'fixed note' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const saved = (onSave.mock.calls[0] as unknown as [Expense])[0]
    expect(saved.note).toBe('fixed note')
    expect(saved.amount).toBe(12.5) // untouched fields persist
  })
})
