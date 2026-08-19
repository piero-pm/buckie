import { Box, Card, Group, Stack, Text } from '@mantine/core'
import { DonutChart } from '@mantine/charts'
import type { Expense } from '../domain/expense'
import { byCategory } from '../domain/aggregation'
import { formatMoney } from '../domain/settings'
import { categoryColor } from '../theme/palette'

/** Spend-by-category donut + synced legend (TICKET-014). Colors come from
 * the stable palette (BR-VI-8): a category keeps its color in every month
 * and view, and list swatches map 1:1 to segments. */
export default function CategoryDonut({
  monthItems,
}: {
  monthItems: Expense[]
}) {
  const breakdown = byCategory(monthItems).filter((c) => c.total > 0)
  const donutData = breakdown.map((c) => ({
    name: c.category,
    value: Math.round(c.total * 100) / 100,
    color: categoryColor(c.category),
  }))
  const grand = donutData.reduce((s, d) => s + d.value, 0)

  return (
    <Card withBorder padding="lg">
      <Text size="sm" fw={600} c="gray.7" mb="sm">
        By category
      </Text>
      {donutData.length === 0 ? (
        <Text size="sm" c="gray.6">
          No spend recorded this month.
        </Text>
      ) : (
        <Group align="center" gap="lg" grow wrap="nowrap">
          <DonutChart data={donutData} strokeWidth={1} size={160} />
          <Stack gap={6}>
            {donutData.map((d) => (
              <Group key={d.name} gap="xs" wrap="nowrap">
                <Box w={10} h={10} bg={d.color} style={{ borderRadius: 2 }} />
                <Text size="xs" c="gray.7" flex={1}>
                  {d.name}
                </Text>
                <Text size="xs" c="gray.6" ff="var(--font-mono)">
                  {grand > 0 ? Math.round((d.value / grand) * 100) : 0}%
                </Text>
                <Text size="xs" fw={600} c="gray.9" ff="var(--font-mono)">
                  {formatMoney(d.value)}
                </Text>
              </Group>
            ))}
          </Stack>
        </Group>
      )}
    </Card>
  )
}
