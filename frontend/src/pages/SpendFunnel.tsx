import { Card, Stack, Text } from '@mantine/core'
import { FunnelChart } from '@mantine/charts'
import type { MonthFunnel } from '../domain/prediction'
import { formatEUR } from '../domain/taxonomy'

interface Props {
  funnel: MonthFunnel
}

/** Where the month's money went (TICKET-028): income -> fixed costs
 * (Rent + Bills) -> other spending -> saved (BR-PRJ-1). A negative saving
 * (overspending) is clamped for the chart shape and called out in text. */
export default function SpendFunnel({ funnel }: Props) {
  const overspent = funnel.saved < 0
  const data = [
    { name: 'Income', value: funnel.income, color: 'orange.6' },
    { name: 'Fixed costs', value: funnel.fixed, color: 'orange.7' },
    { name: 'Other spending', value: funnel.other, color: 'orange.4' },
    { name: 'Saved', value: Math.max(0, funnel.saved), color: 'green.6' },
  ]
  return (
    <Card withBorder padding="lg" aria-label="spend funnel">
      <Stack gap="sm">
        <Text size="sm" fw={600} c="gray.7">
          Where your money went
        </Text>
        <FunnelChart size={260} data={data} />
        {overspent && (
          <Text role="alert" size="xs" c="red.7">
            You spent {formatEUR(-funnel.saved)} more than you earned this
            month.
          </Text>
        )}
      </Stack>
    </Card>
  )
}
