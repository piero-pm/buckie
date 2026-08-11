import { useState, FormEvent } from 'react'
import { CATEGORIES, formatEUR, type Category } from '../domain/taxonomy'
import { validateRecurring, type Recurring } from '../domain/expense'
import { newId } from '../domain/ids'

interface Props {
  items: Recurring[]
  onSave: (item: Recurring) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onBack: () => void
}

/** Register, review, and end recurring monthly expenses (TICKET-010/012). */
export default function RecurringPage({
  items,
  onSave,
  onDelete,
  onBack,
}: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [day, setDay] = useState('1')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = validateRecurring({
      amount: Number(amount),
      category,
      dayOfMonth: Number(day),
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    try {
      await onSave({
        id: newId(),
        amount: Number(amount),
        category: category as Category,
        dayOfMonth: Number(day),
        active: true,
        createdAt: new Date().toISOString(),
      })
      setAmount('')
      setCategory('')
      setDay('1')
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main aria-label="recurring expenses">
      <h1>Recurring monthly expenses</h1>
      <ul>
        {items.map((r) => (
          <li key={r.id}>
            {formatEUR(r.amount)} — {r.category} — day {r.dayOfMonth}
            {!r.active && ' (ended)'}
            <button
              onClick={async () => {
                if (r.active) await onSave({ ...r, active: false })
                else await onDelete(r.id)
              }}
            >
              {r.active ? 'End' : 'Remove'}
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} aria-label="add recurring">
        <h2>Add recurring</h2>
        <label htmlFor="amount">Amount (€)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          required
        >
          <option value="">Choose…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label htmlFor="day">Day of month</label>
        <input
          id="day"
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Add'}
        </button>
        <button type="button" onClick={onBack}>
          Back
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </main>
  )
}
