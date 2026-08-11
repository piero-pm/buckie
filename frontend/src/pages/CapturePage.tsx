import { useState, FormEvent } from 'react'
import { CATEGORIES, formatEUR, type Category } from '../domain/taxonomy'
import { validateExpense, type Expense } from '../domain/expense'
import { newId } from '../domain/ids'

interface Props {
  existing: Expense[]
  onSave: (expense: Expense) => Promise<void>
  onBack: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

/** Quick expense capture (TICKET-005/006/007/008). Validates BR-DQ-1..4 and
 * warns on a likely duplicate (same amount+category+date, BR-DQ-5) without
 * blocking a genuine repeat. */
export default function CapturePage({ existing, onSave, onBack }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [dup, setDup] = useState<Expense | null>(null)
  const [busy, setBusy] = useState(false)

  function reset() {
    setAmount('')
    setCategory('')
    setDate(today())
    setNote('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = validateExpense({ amount: Number(amount), category, date })
    if (!result.ok) {
      setError(result.error)
      return
    }
    const candidate = { amount: Number(amount), category, date }
    const match = existing.find(
      (x) =>
        x.amount === candidate.amount &&
        x.category === candidate.category &&
        x.date === candidate.date
    )
    if (match && !dup) {
      setDup(match) // ask once; user can confirm to keep the repeat
      return
    }
    setBusy(true)
    try {
      await onSave({
        id: newId(),
        amount: candidate.amount,
        category: candidate.category as Category,
        date: candidate.date,
        note: note || undefined,
        createdAt: new Date().toISOString(),
      })
      reset()
      setDup(null)
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="record expense">
      <h1>Record a spend</h1>
      <label htmlFor="amount">Amount (€)</label>
      <input
        id="amount"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
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
      <label htmlFor="date">Date</label>
      <input
        id="date"
        type="date"
        value={date}
        max={today()}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <label htmlFor="note">Note (optional)</label>
      <input
        id="note"
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {dup && (
        <p role="alert">
          You already have a {formatEUR(dup.amount)} {dup.category} on{' '}
          {dup.date}. Save again to keep both.
        </p>
      )}
      <button type="submit" disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={onBack}>
        Back
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
