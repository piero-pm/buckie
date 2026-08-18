import { useState, FormEvent } from 'react'
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
import { IconTrash } from '@tabler/icons-react'
import { formatMoney } from '../domain/settings'
import {
  EVENT_KINDS,
  EVENT_LABELS,
  validateIncomeEvent,
  type EventKind,
  type IncomeEvent,
} from '../domain/incomeEvent'
import { newId } from '../domain/ids'
import { failToast } from '../components/failToast'

interface Props {
  events: IncomeEvent[]
  onSave: (event: IncomeEvent) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const today = () => new Date().toISOString().slice(0, 10)

/** One-off income events section (BR-IOFF-1): add bonus/gift/refund/other
 * money-in that lands once, listed newest first. */
export default function IncomeEvents({ events, onSave, onDelete }: Props) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [eventKind, setEventKind] = useState<EventKind>('bonus')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = validateIncomeEvent({
      amount: Number(amount),
      date,
      eventKind,
      note: note || undefined,
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
        date,
        eventKind,
        note: note || undefined,
        createdAt: new Date().toISOString(),
      })
      setAmount('')
      setNote('')
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <Box component="section" aria-label="one-off income events" mt="xl">
      <Stack gap="md">
        <Text size="sm" fw={600} c="gray.7">
          One-off events (bonus, gift, refund)
        </Text>
        {sorted.length === 0 && (
          <Text size="sm" c="gray.5">
            No one-off events recorded.
          </Text>
        )}
        <Stack gap={0} mb="lg">
          {sorted.map((v) => (
            <Group
              key={v.id}
              justify="space-between"
              py="sm"
              styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
            >
              <Stack gap={2}>
                <Group gap="xs">
                  <Text size="sm" fw={600} c="gray.9">
                    {formatMoney(v.amount)}
                  </Text>
                  <Text size="sm" c="gray.7">
                    {EVENT_LABELS[v.eventKind]}
                  </Text>
                </Group>
                <Text size="xs" c="gray.5">
                  {v.date}
                  {v.note ? ` · ${v.note}` : ''}
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={async () => {
                  try {
                    await onDelete(v.id)
                  } catch {
                    failToast('remove')
                  }
                }}
                aria-label="remove event"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
        <form onSubmit={handleAdd} aria-label="add income event">
          <Stack gap="md">
            <Select
              label="Kind"
              id="event-kind"
              data={EVENT_KINDS.map((k) => ({
                value: k,
                label: EVENT_LABELS[k],
              }))}
              value={eventKind}
              onChange={(v) => setEventKind((v as EventKind) ?? 'bonus')}
            />
            <TextInput
              label="Amount"
              id="event-amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              leftSection={<span style={{ fontWeight: 600 }}>€</span>}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <TextInput
              label="Date"
              id="event-date"
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextInput
              label="Note (optional)"
              id="event-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" fullWidth loading={busy}>
              Add event
            </Button>
            {error && (
              <Text role="alert" c="red.7" size="sm">
                {error}
              </Text>
            )}
          </Stack>
        </form>
      </Stack>
    </Box>
  )
}
