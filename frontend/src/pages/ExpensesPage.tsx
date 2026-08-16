import { useState } from 'react'
import { ActionIcon, Box, Button, Group, Stack, Text } from '@mantine/core'
import { IconArrowLeft, IconPencil, IconTrash } from '@tabler/icons-react'
import { formatEUR } from '../domain/taxonomy'
import type { Expense } from '../domain/expense'
import { failToast } from '../components/failToast'
import PageShell from '../components/PageShell'
import EditExpense from './EditExpense'

interface Props {
  expenses: Expense[]
  onUpdate: (expense: Expense) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onBack: () => void
}

/** Review + correct recent expenses (TICKET-009/025). Delete failures are
 * visible toasts; rows remain until the API succeeds (BR-ERR-4). */
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
                    try {
                      await onDelete(e.id)
                    } catch {
                      failToast('delete')
                    }
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
