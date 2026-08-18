import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconArrowLeft, IconSearch } from '@tabler/icons-react'
import { CATEGORIES, LEGACY_CATEGORIES } from '../domain/taxonomy'
import { browseExpenses, browserMonths } from '../domain/expenseFilter'
import { ym } from '../domain/aggregation'
import type { Expense, Recurring } from '../domain/expense'
import BrowserRow from '../components/BrowserRow'
import { failToast } from '../components/failToast'
import PageShell from '../components/PageShell'
import EditExpense from './EditExpense'

interface Props {
  expenses: Expense[]
  recurring: Recurring[]
  onUpdate: (expense: Expense) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onBack: () => void
}

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

/** Expense browser (BR-LST-1, TICKET-044): month selector + category filter +
 * text search over note + category. Replaces the flat recent list (gate
 * 2026-08-18); recurring rows render read-only (edit them on their page). */
export default function ExpensesPage({
  expenses,
  recurring,
  onUpdate,
  onDelete,
  onBack,
}: Props) {
  const current = ym(new Date())
  const [month, setMonth] = useState(current)
  const [category, setCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Expense | null>(null)

  const months = useMemo(
    () => browserMonths(expenses, recurring, current),
    [expenses, recurring, current]
  )
  const categories = useMemo(() => {
    const used = new Set<string>([
      ...expenses.map((e) => e.category),
      ...recurring.map((r) => r.category),
    ])
    const legacy = LEGACY_CATEGORIES.filter((c) => used.has(c))
    return [...CATEGORIES, ...legacy]
  }, [expenses, recurring])

  const rows = useMemo(
    () =>
      browseExpenses(expenses, recurring, {
        month,
        category: category ?? undefined,
        query: query || undefined,
      }),
    [expenses, recurring, month, category, query]
  )

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
      title="Expenses"
      subtitle={`${rows.length} in ${monthLabel(month)}`}
      card={false}
    >
      <Box component="main" aria-label="expense browser">
        <Stack gap="md" mb="lg">
          <Group grow>
            <Select
              label="Month"
              id="browser-month"
              data={months.map((m) => ({ value: m, label: monthLabel(m) }))}
              value={month}
              onChange={(v) => setMonth(v ?? current)}
            />
            <Select
              label="Category"
              id="browser-category"
              placeholder="All"
              data={categories}
              value={category}
              onChange={setCategory}
              searchable
              clearable
            />
          </Group>
          <TextInput
            label="Search"
            id="browser-search"
            placeholder="note or category…"
            leftSection={<IconSearch size={16} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Stack>
        {rows.length === 0 && (
          <Text size="sm" c="gray.5">
            No expenses match.
          </Text>
        )}
        <Stack gap={0}>
          {rows.map((e) => (
            <BrowserRow
              key={e.id}
              expense={e}
              onEdit={() => setEditing(e)}
              onDelete={async () => {
                try {
                  await onDelete(e.id)
                } catch {
                  failToast('delete')
                }
              }}
            />
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
