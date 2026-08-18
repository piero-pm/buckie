import { ActionIcon, Badge, Group, Stack, Text } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { formatMoney } from '../domain/settings'
import type { Expense } from '../domain/expense'

/** One browser row (BR-LST-1): amount, category, date + note, recurring
 * badge for synthetic ids ("templateId:yyyy-mm"), edit/delete on one-offs. */
export default function BrowserRow({
  expense: e,
  onEdit,
  onDelete,
}: {
  expense: Expense
  onEdit: () => void
  onDelete: () => Promise<void>
}) {
  const recurring = e.id.includes(':')
  return (
    <Group
      justify="space-between"
      py="sm"
      styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
    >
      <Stack gap={2}>
        <Group gap="xs">
          <Text size="sm" fw={600} c="gray.9">
            {formatMoney(e.amount)}
          </Text>
          <Text size="sm" c="gray.7">
            {e.category}
          </Text>
          {recurring && (
            <Badge size="xs" variant="light" color="orange">
              recurring
            </Badge>
          )}
        </Group>
        <Text size="xs" c="gray.6">
          {e.date}
          {e.note ? ` · ${e.note}` : ''}
        </Text>
      </Stack>
      {!recurring && (
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
            color="red"
            onClick={() => void onDelete()}
            aria-label="delete"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      )}
    </Group>
  )
}
