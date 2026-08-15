import { Box, Card, Group, Stack, Text } from '@mantine/core'
import { DonutChart } from '@mantine/charts'
import type { Expense } from '../domain/expense'
import { byCategory } from '../domain/aggregation'
import { formatEUR } from '../domain/taxonomy'

// Stable category colours so the donut is consistent across months
// (orange/amber identity, TICKET-017).
const COLORS = [
  '#c2410c',
  '#9a3412',
  '#ea580c',
  '#f97316',
  '#7c2d12',
  '#fb923c',
  '#b45309',
  '#fdba74',
]

/** Spend-by-category donut + synced legend (TICKET-014). Pure client-side
 * aggregation over the month's items. */
export default function CategoryDonut({
  monthItems,
}: {
  monthItems: Expense[]
}) {
  const breakdown = byCategory(monthItems).filter((c) => c.total > 0)
  const donutData = breakdown.map((c, i) => ({
    name: c.category,
    value: Math.round(c.total * 100) / 100,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <Card withBorder padding="lg">
      <Text size="sm" fw={600} c="gray.7" mb="sm">
        By category
      </Text>
      {donutData.length === 0 ? (
        <Text size="sm" c="gray.5">
          No spend recorded this month.
        </Text>
      ) : (
        <Group align="center" gap="lg" grow wrap="nowrap">
          <DonutChart data={donutData} strokeWidth={1} size={160} />
          <Stack gap={6}>
            {donutData.map((d) => (
              <Group key={d.name} gap="xs">
                <Box w={10} h={10} bg={d.color} style={{ borderRadius: 2 }} />
                <Text size="xs" c="gray.7" flex={1}>
                  {d.name}
                </Text>
                <Text size="xs" fw={600} c="gray.9">
                  {formatEUR(d.value)}
                </Text>
              </Group>
            ))}
          </Stack>
        </Group>
      )}
    </Card>
  )
}
