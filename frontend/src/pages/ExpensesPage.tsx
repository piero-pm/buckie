import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconArrowLeft, IconPencil, IconTrash } from '@tabler/icons-react'
import { CATEGORIES, formatEUR, type Category } from '../domain/taxonomy'
import { validateExpense, type Expense } from '../domain/expense'
import PageShell from '../components/PageShell'

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
    <PageShell
      title="Recent expenses"
      subtitle={`${sorted.length} recorded`}
      card={false}
    >
      <Box component="main" aria-label="recent expenses">
        {sorted.length === 0 && (
          <Text size="sm" c="gray.5">
            No expenses yet.
          </Text>
        )}
        <Stack gap={0}>
          {sorted.map((e) => (
            <Group
              key={e.id}
              justify="space-between"
              py="sm"
              styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
            >
              <Stack gap={2}>
                <Group gap="xs">
                  <Text size="sm" fw={600} c="gray.9">
                    {formatEUR(e.amount)}
                  </Text>
                  <Text size="sm" c="gray.7">
                    {e.category}
                  </Text>
                </Group>
                <Text size="xs" c="gray.5">
                  {e.date}
                  {e.note ? ` · ${e.note}` : ''}
                </Text>
              </Stack>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={() => setEditing(e)}
                  aria-label="edit"
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={async () => {
                    await onDelete(e.id)
                  }}
                  aria-label="delete"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          ))}
        </Stack>
        <Group justify="center" mt="lg">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
        </Group>
      </Box>
    </PageShell>
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
            data={CATEGORIES as readonly string[]}
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
            <Button onClick={save}>Save</Button>
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
