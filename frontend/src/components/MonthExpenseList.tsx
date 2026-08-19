import { Badge, Card, Group, Stack, Text } from '@mantine/core'
import type { Expense } from '../domain/expense'
import { formatMoney } from '../domain/settings'
import { CategoryIcon } from './CategoryIcon'

/** This month's expense list (BR-DASH-1, TICKET-039; BR-VI-12 re-theme):
 * one-off plus recurring-generated items, date-desc. Rows carry a category
 * icon in the stable palette color, RECURRING renders as an amber mono
 * pill, hairline dividers between rows, right-aligned mono amounts. */
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
      styles={{ root: { borderBottom: '1px solid var(--line)' } }}
    >
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Group gap={6} wrap="nowrap">
          <CategoryIcon category={e.category} />
          <Text size="sm" fw={500} c="gray.9">
            {e.category}
          </Text>
          {recurring && (
            <Badge
              size="xs"
              radius="sm"
              variant="light"
              color="amber"
              ff="var(--font-mono)"
              tt="uppercase"
              fz={9}
              styles={{ root: { paddingTop: 1, paddingBottom: 1 } }}
            >
              recurring
            </Badge>
          )}
        </Group>
        <Text size="xs" c="gray.6" ff="var(--font-mono)">
          {e.date}
          {e.note ? ` · ${e.note}` : ''}
        </Text>
      </Stack>
      <Text size="sm" fw={600} c="gray.9" ff="var(--font-mono)">
        {formatMoney(e.amount)}
      </Text>
    </Group>
  )
}
