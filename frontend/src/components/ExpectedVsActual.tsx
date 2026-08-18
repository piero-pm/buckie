import { Card, Group, Progress, Stack, Text } from '@mantine/core'
import { formatMoney } from '../domain/settings'
import type { BucketCompare } from '../domain/comparison'

/** Expected vs actual per bucket (BR-CMP-1, TICKET-038): over renders red
 * with the delta, under/equal renders green with the remaining amount.
 * Buckets without an expectation show actual only. */
export default function ExpectedVsActual({ rows }: { rows: BucketCompare[] }) {
  const withExpectation = rows.filter((r) => r.expected !== undefined)
  if (withExpectation.length === 0) return null
  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <Text size="sm" fw={600} c="gray.7">
          Expected vs actual
        </Text>
        {rows.map((r) => (
          <Row key={r.key} row={r} />
        ))}
      </Stack>
    </Card>
  )
}

function Row({ row }: { row: BucketCompare }) {
  if (row.expected === undefined) {
    return (
      <Group justify="space-between">
        <Text size="sm" c="gray.6">
          {row.label}
        </Text>
        <Text size="sm" c="gray.6">
          {formatMoney(row.actual)} — no expectation
        </Text>
      </Group>
    )
  }
  const pct = Math.min(100, (row.actual / row.expected) * 100)
  const over = row.over ?? false
  return (
    <Stack gap={4}>
      <Group justify="space-between">
        <Text size="sm" fw={500} c="gray.9">
          {row.label}
        </Text>
        <Text
          size="sm"
          fw={600}
          c={over ? 'red.7' : 'green.7'}
          aria-label={`${row.label} delta`}
        >
          {formatMoney(row.actual)} / {formatMoney(row.expected)}
          {over
            ? ` (+${formatMoney(row.delta ?? 0)} over)`
            : ` (${formatMoney(-(row.delta ?? 0))} left)`}
        </Text>
      </Group>
      <Progress value={pct} color={over ? 'red.6' : 'green.6'} size="sm" />
    </Stack>
  )
}
