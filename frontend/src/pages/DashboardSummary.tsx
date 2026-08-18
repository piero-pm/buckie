import { Card, Group, Stack, Text } from '@mantine/core'
import { formatMoney } from '../domain/settings'

/** Month summary figures (TICKET-022): spend total, income total, and net
 * (income − expenses). Income comes from monthIncome over active sources. */
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
          <Text size="xs" c="gray.6" tt="uppercase" fw={600}>
            Total this month
          </Text>
          <Text size="2rem" fw={700} c="gray.9" mt={4} aria-label="month total">
            {formatMoney(total)}
          </Text>
        </div>
        <Group justify="space-between">
          <Text size="sm" c="gray.6">
            Income
          </Text>
          <Text size="sm" fw={600} c="gray.9" aria-label="month income">
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
            c={net >= 0 ? 'green.7' : 'red.7'}
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
