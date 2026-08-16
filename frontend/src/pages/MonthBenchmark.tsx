import { Card, Stack, Text } from '@mantine/core'
import { formatEUR } from '../domain/taxonomy'

interface Props {
  /** BR-PRJ-1 benchmark: average spend over the last up to 3 months;
   * null hides the card (no prior month). */
  expected: number | null
  total: number
}

/** "This month against expectation" (TICKET-028): shows the 3-month-average
 * benchmark beside the current spend with the under/over pace. */
export default function MonthBenchmark({ expected, total }: Props) {
  if (expected === null) return null
  const delta = expected - total
  const pace = delta >= 0 ? 'under' : 'over'
  return (
    <Card withBorder padding="lg" aria-label="expected spend">
      <Stack gap={4}>
        <Text size="sm" fw={600} c="gray.7">
          Expected spend (3-month average)
        </Text>
        <Text size="xl" fw={700} c="gray.9">
          {formatEUR(expected)}
        </Text>
        <Text size="xs" c="gray.5">
          You're {formatEUR(Math.abs(delta))} {pace} that pace this month.
        </Text>
      </Stack>
    </Card>
  )
}
