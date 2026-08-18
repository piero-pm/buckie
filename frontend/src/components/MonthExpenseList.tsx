import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { Expense } from '../domain/expense'
import { formatMoney } from '../domain/settings'

/** This month's expense list (BR-DASH-1, TICKET-039): one-off plus
 * recurring-generated items, date-desc, recurring marked. Synthetic ids are
 * "templateId:yyyy-mm" so the ":" marks recurring rows. */
export default function MonthExpenseList({ items }: { items: Expense[] }) {
  const sorted = [...items].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <Card withBorder padding="lg">
      <Stack gap={0}>
        <Text size="sm" fw={600} c="gray.7" mb="xs">
          This month's expenses
        </Text>
        {sorted.length === 0 ? (
          <Text size="sm" c="gray.6" py="xs">
            Nothing recorded this month yet.
          </Text>
        ) : (
          sorted.map((e) => <Row key={e.id} expense={e} />)
        )}
      </Stack>
    </Card>
  )
}

function Row({ expense: e }: { expense: Expense }) {
  const recurring = e.id.includes(':')
  return (
    <Group
      justify="space-between"
      py="xs"
      styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
    >
      <Stack gap={2}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={500} c="gray.9">
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
      <Text size="sm" fw={600} c="gray.9">
        {formatMoney(e.amount)}
      </Text>
    </Group>
  )
}
