import { Card, Group, Stack, Text } from '@mantine/core'
import { formatMoney } from '../domain/settings'

/** Month summary figures (TICKET-022; BR-VI-7 re-theme): spend total as a
 * Fraunces hero number, income total, and net (income − expenses) colored
 * moss/rust by sign. Income comes from monthIncome over active sources. */
export default function DashboardSummary({
  total,
  income,
  net,
}: {
  total: number
  income: number
  net: number
}) {
  return (
    <Card withBorder padding="lg">
      <Stack gap="xs">
        <div>
          <Text
            size="xs"
            c="gray.6"
            tt="uppercase"
            fw={600}
            ff="var(--font-mono)"
          >
            Total this month
          </Text>
          <Text
            size="2.3rem"
            fw={700}
            ff="var(--font-display)"
            c="gray.9"
            mt={4}
            aria-label="month total"
            style={{ letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            {formatMoney(total)}
          </Text>
        </div>
        <Group justify="space-between">
          <Text size="sm" c="gray.6">
            Income
          </Text>
          <Text
            size="sm"
            fw={600}
            c="gray.9"
            ff="var(--font-mono)"
            aria-label="month income"
          >
            {formatMoney(income)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="gray.6">
            Net (income − expenses)
          </Text>
          <Text
            size="sm"
            fw={600}
            ff="var(--font-mono)"
            c={net >= 0 ? 'moss.6' : 'rust.7'}
            aria-label="net"
          >
            {netText(net)}
          </Text>
        </Group>
      </Stack>
    </Card>
  )
}

function netText(net: number): string {
  return net < 0 ? `−${formatMoney(-net)}` : formatMoney(net)
}
