import { Card, Group, Progress, Stack, Text } from '@mantine/core'
import { savedThisMonth } from '../domain/comparison'
import { formatEUR } from '../domain/taxonomy'

/** The green saved bar (BR-DASH-2, TICKET-038): income minus spend for the
 * month; an over-spend shows a red callout instead. */
export default function SavedBar({
  income,
  spend,
}: {
  income: number
  spend: number
}) {
  const { saved, overspent } = savedThisMonth(income, spend)
  const pct = income > 0 ? Math.min(100, (saved / income) * 100) : 0
  return (
    <Card withBorder padding="lg">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="gray.6">
            Saved this month
          </Text>
          {overspent > 0 ? (
            <Text size="sm" fw={600} c="red.7" aria-label="overspent">
              Over-spent {formatEUR(overspent)}
            </Text>
          ) : (
            <Text size="sm" fw={600} c="green.7" aria-label="saved">
              {formatEUR(saved)}
            </Text>
          )}
        </Group>
        <Progress
          value={pct}
          color={overspent > 0 ? 'red.6' : 'green.6'}
          size="sm"
        />
      </Stack>
    </Card>
  )
}
