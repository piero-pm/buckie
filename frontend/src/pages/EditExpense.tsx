import { useState } from 'react'
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { editableCategories, type Category } from '../domain/taxonomy'
import { validateExpense, type Expense } from '../domain/expense'
import PageShell from '../components/PageShell'

const today = () => new Date().toISOString().slice(0, 10)

/** Inline edit sub-form (TICKET-009/025): re-applies BR-DQ-1..4 and shows a
 * visible error when the encrypted save fails (BR-ERR-4). */
export default function EditExpense({
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
  const [busy, setBusy] = useState(false)

  async function save() {
    setError('')
    const result = validateExpense({ amount: Number(amount), category, date })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    try {
      await onSave({ ...expense, amount: Number(amount), category, date })
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Edit expense" card>
      <form aria-label="edit expense" onSubmit={(e) => e.preventDefault()}>
        <Stack gap="md">
          <TextInput
            label="Amount"
            id="amount"
            type="number"
            step="0.01"
            leftSection={<span style={{ fontWeight: 600 }}>€</span>}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Select
            label="Category"
            id="category"
            data={editableCategories(category)}
            value={category}
            onChange={(v) => setCategory((v as Category) ?? category)}
            searchable
          />
          <TextInput
            label="Date"
            id="date"
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
          />
          <Group grow>
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={save} loading={busy}>
              Save
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
