import { useState, FormEvent } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { IconArrowLeft, IconTrash } from '@tabler/icons-react'
import {
  categoriesByBucket,
  formatEUR,
  type Category,
} from '../domain/taxonomy'
import { ym } from '../domain/aggregation'
import { validateRecurring, type Recurring } from '../domain/expense'
import { newId } from '../domain/ids'
import { failToast } from '../components/failToast'
import PageShell from '../components/PageShell'

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

  const endMonth = ym(new Date()) // history-preserving end (BR-REC-END-1)

  return (
    <PageShell
      title="Recurring monthly"
      subtitle="Fixed costs that repeat every month."
      card={false}
    >
      <Box component="main" aria-label="recurring expenses">
        {items.length === 0 && (
          <Text size="sm" c="gray.5">
            No recurring expenses yet.
          </Text>
        )}
        <Stack gap={0} mb="lg">
          {items.map((r) => (
            <Group
              key={r.id}
              justify="space-between"
              py="sm"
              styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
            >
              <Stack gap={2}>
                <Group gap="xs">
                  <Text size="sm" fw={600} c="gray.9">
                    {formatEUR(r.amount)}
                  </Text>
                  <Text size="sm" c="gray.7">
                    {r.category}
                  </Text>
                  {!r.active && (
                    <Badge size="xs" color="gray" variant="light">
                      ended{r.endedAt ? ` ${r.endedAt}` : ''}
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="gray.5">
                  day {r.dayOfMonth} of each month
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color={r.active ? 'gray' : 'red'}
                onClick={async () => {
                  try {
                    if (r.active)
                      await onSave({ ...r, active: false, endedAt: endMonth })
                    else await onDelete(r.id)
                  } catch {
                    failToast(r.active ? 'end' : 'remove')
                  }
                }}
                aria-label={r.active ? 'end' : 'remove'}
              >
                {r.active ? (
                  <Text size="xs">End</Text>
                ) : (
                  <IconTrash size={16} />
                )}
              </ActionIcon>
            </Group>
          ))}
        </Stack>

        <form onSubmit={handleAdd} aria-label="add recurring">
          <Stack gap="md">
            <Text size="sm" fw={600} c="gray.7">
              Add recurring
            </Text>
            <TextInput
              label="Amount"
              id="amount"
              type="number"
              step="0.01"
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
              data={categoriesByBucket()}
              value={category}
              onChange={(v) => setCategory((v as Category) ?? '')}
              searchable
              required
            />
            <TextInput
              label="Day of month"
              id="day"
              type="number"
              min="1"
              max="31"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={busy}>
              Add
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
      </Box>
    </PageShell>
  )
}
