import { useState } from 'react'
import { CATEGORIES, formatEUR, type Category } from '../domain/taxonomy'
import { validateExpense, type Expense } from '../domain/expense'

interface Props {
  expenses: Expense[]
  onUpdate: (expense: Expense) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onBack: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

/** Review + correct recent expenses (TICKET-009). Edits re-apply BR-DQ-1..4. */
export default function ExpensesPage({
  expenses,
  onUpdate,
  onDelete,
  onBack,
}: Props) {
  const [editing, setEditing] = useState<Expense | null>(null)

  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1))

  if (editing) {
    return (
      <EditExpense
        expense={editing}
        onSave={async (e) => {
          await onUpdate(e)
          setEditing(null)
        }}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <main aria-label="recent expenses">
      <h1>Recent expenses</h1>
      {sorted.length === 0 && <p>No expenses yet.</p>}
      <ul>
        {sorted.map((e) => (
          <li key={e.id}>
            {formatEUR(e.amount)} — {e.category} — {e.date}
            {e.note ? ` (${e.note})` : ''}
            <button onClick={() => setEditing(e)}>Edit</button>
            <button
              onClick={async () => {
                await onDelete(e.id)
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onBack}>Back</button>
    </main>
  )
}

function EditExpense({
  expense,
  onSave,
  onCancel,
}: {
  expense: Expense
  onSave: (e: Expense) => Promise<void>
  onCancel: () => void
}) {
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState<Category>(expense.category)
  const [date, setDate] = useState(expense.date)
  const [error, setError] = useState('')

  async function save() {
    setError('')
    const result = validateExpense({ amount: Number(amount), category, date })
    if (!result.ok) {
      setError(result.error)
      return
    }
    await onSave({ ...expense, amount: Number(amount), category, date })
  }

  return (
    <form aria-label="edit expense" onSubmit={(e) => e.preventDefault()}>
      <h1>Edit expense</h1>
      <label htmlFor="amount">Amount (€)</label>
      <input
        id="amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label htmlFor="category">Category</label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label htmlFor="date">Date</label>
      <input
        id="date"
        type="date"
        value={date}
        max={today()}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="button" onClick={save}>
        Save
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
