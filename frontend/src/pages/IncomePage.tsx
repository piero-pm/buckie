import { useState } from 'react'
import { ActionIcon, Badge, Box, Group, Stack, Text } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { formatMoney } from '../domain/settings'
import {
  FREQUENCY_LABELS,
  INCOME_LABELS,
  type IncomeSource,
} from '../domain/income'
import type { IncomeEvent } from '../domain/incomeEvent'
import { failToast } from '../components/failToast'
import PageShell from '../components/PageShell'
import IncomeForm from './IncomeForm'
import IncomeEvents from './IncomeEvents'

interface Props {
  items: IncomeSource[]
  events: IncomeEvent[]
  onSave: (source: IncomeSource) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onSaveEvent: (event: IncomeEvent) => Promise<void>
  onDeleteEvent: (id: string) => Promise<void>
  onBack: () => void
}

/** Manage income sources + one-off events (TICKET-020/042/043). Sources are
 * editable (BR-EDIT-1); ending preserves past months (EX-INC-3). */
export default function IncomePage({
  items,
  events,
  onSave,
  onDelete,
  onSaveEvent,
  onDeleteEvent,
  onBack,
}: Props) {
  const [editing, setEditing] = useState<IncomeSource | null>(null)

  return (
    <PageShell
      title="Income"
      subtitle="Money in: recurring sources and one-off events."
      card={false}
    >
      <Box component="main" aria-label="income sources">
        {items.length === 0 && (
          <Text size="sm" c="gray.6">
            No income sources yet.
          </Text>
        )}
        <Stack gap={0} mb="lg">
          {items.map((s) => (
            <SourceRow
              key={s.id}
              source={s}
              onSave={onSave}
              onDelete={onDelete}
              onEdit={() => setEditing(s)}
            />
          ))}
        </Stack>
        <IncomeForm
          onSave={async (s) => {
            await onSave(s)
            setEditing(null)
          }}
          onBack={onBack}
          source={editing ?? undefined}
          onCancelEdit={() => setEditing(null)}
        />
        <IncomeEvents
          events={events}
          onSave={onSaveEvent}
          onDelete={onDeleteEvent}
        />
      </Box>
    </PageShell>
  )
}

function SourceRow({
  source: s,
  onSave,
  onDelete,
  onEdit,
}: {
  source: IncomeSource
  onSave: (source: IncomeSource) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: () => void
}) {
  const frequency = FREQUENCY_LABELS[s.frequency ?? 'monthly'].toLowerCase()
  return (
    <Group
      justify="space-between"
      py="sm"
      styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
    >
      <Stack gap={2}>
        <Group gap="xs">
          <Text size="sm" fw={600} c="gray.9">
            {formatMoney(s.amount)}
          </Text>
          <Text size="sm" c="gray.7">
            {INCOME_LABELS[s.kind]}
          </Text>
          {s.label && (
            <Text size="xs" c="gray.6">
              {s.label}
            </Text>
          )}
          {!s.active && (
            <Badge size="xs" color="gray" variant="light">
              ended
            </Badge>
          )}
        </Group>
        <Text size="xs" c="gray.6">
          {frequency}
          {s.dayOfMonth ? `, day ${s.dayOfMonth}` : ''}
        </Text>
      </Stack>
      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={onEdit}
          aria-label="edit"
        >
          <IconPencil size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color={s.active ? 'gray' : 'red'}
          onClick={async () => {
            try {
              if (s.active) {
                await onSave({
                  ...s,
                  active: false,
                  endedAt: new Date().toISOString(),
                })
              } else {
                await onDelete(s.id)
              }
            } catch {
              failToast(s.active ? 'end' : 'remove')
            }
          }}
          aria-label={s.active ? 'end' : 'remove'}
        >
          {s.active ? <Text size="xs">End</Text> : <IconTrash size={16} />}
        </ActionIcon>
      </Group>
    </Group>
  )
}
