import { useState, FormEvent } from 'react'
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft } from '@tabler/icons-react'
import { CATEGORIES, formatEUR, type Category } from '../domain/taxonomy'
import { validateExpense, type Expense } from '../domain/expense'
import { newId } from '../domain/ids'
import PageShell from '../components/PageShell'

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
      setDup(match)
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
      notifications.show({
        message: 'Expense saved',
        color: 'green',
        autoClose: 2000,
      })
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell
      title="Record a spend"
      subtitle="Capture a spend in the moment."
      card
    >
      <form onSubmit={handleSubmit} aria-label="record expense">
        <Stack gap="md">
          <TextInput
            label="Amount"
            id="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            leftSection={<span style={{ fontWeight: 600 }}>€</span>}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select
            label="Category"
            id="category"
            placeholder="Choose…"
            data={CATEGORIES as readonly string[]}
            value={category}
            onChange={(v) => setCategory((v as Category) ?? '')}
            searchable
            required
          />
          <TextInput
            label="Date"
            id="date"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <TextInput
            label="Note (optional)"
            id="note"
            type="text"
            placeholder="e.g. lunch with team"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {dup && (
            <Text role="alert" c="yellow.9" size="sm">
              You already have a {formatEUR(dup.amount)} {dup.category} on{' '}
              {dup.date}. Save again to keep both.
            </Text>
          )}
          <Button type="submit" fullWidth loading={busy}>
            Save
          </Button>
          <Group justify="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>
          {error && (
            <Text role="alert" c="red.7" size="sm">
              {error}
            </Text>
          )}
        </Stack>
      </form>
    </PageShell>
  )
}
