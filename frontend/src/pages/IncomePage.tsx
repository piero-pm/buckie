import { ActionIcon, Badge, Box, Group, Stack, Text } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { formatEUR } from '../domain/taxonomy'
import { INCOME_LABELS, type IncomeSource } from '../domain/income'
import { failToast } from '../components/failToast'
import PageShell from '../components/PageShell'
import IncomeForm from './IncomeForm'

interface Props {
  items: IncomeSource[]
  onSave: (source: IncomeSource) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onBack: () => void
}

/** Manage monthly income sources — salary, freelance, investments, other
 * (TICKET-020, kinds extended BR-INC-4). Editable anytime (EX-INC-4);
 * ending preserves past months (EX-INC-3). */
export default function IncomePage({ items, onSave, onDelete, onBack }: Props) {
  return (
    <PageShell
      title="Income"
      subtitle="Monthly money in: salary, freelance, investments, and more."
      card={false}
    >
      <Box component="main" aria-label="income sources">
        {items.length === 0 && (
          <Text size="sm" c="gray.5">
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
            />
          ))}
        </Stack>
        <IncomeForm onSave={onSave} onBack={onBack} />
      </Box>
    </PageShell>
  )
}

function SourceRow({
  source: s,
  onSave,
  onDelete,
}: {
  source: IncomeSource
  onSave: (source: IncomeSource) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <Group
      justify="space-between"
      py="sm"
      styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
    >
      <Stack gap={2}>
        <Group gap="xs">
          <Text size="sm" fw={600} c="gray.9">
            {formatEUR(s.amount)}
          </Text>
          <Text size="sm" c="gray.7">
            {INCOME_LABELS[s.kind]}
          </Text>
          {s.label && (
            <Text size="xs" c="gray.5">
              {s.label}
            </Text>
          )}
          {!s.active && (
            <Badge size="xs" color="gray" variant="light">
              ended
            </Badge>
          )}
        </Group>
        {s.dayOfMonth && (
          <Text size="xs" c="gray.5">
            day {s.dayOfMonth} of each month
          </Text>
        )}
      </Stack>
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
  )
}
