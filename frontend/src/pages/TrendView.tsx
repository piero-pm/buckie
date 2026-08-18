import { useMemo, useState } from 'react'
import { Box, Card, SegmentedControl, Stack, Text } from '@mantine/core'
import { LineChart } from '@mantine/charts'
import type { MonthlyFigure } from '../domain/prediction'
import { cumulativeNet, windowAverages } from '../domain/prediction'
import { formatMoney } from '../domain/settings'

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

const nextMonthLabel = (ymStr: string, step: number) => {
  const [y, m] = ymStr.split('-').map(Number)
  const d = new Date(y, m - 1 + step, 1)
  return monthLabel(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  )
}

const round2 = (v: number) => Math.round(v * 100) / 100

/** Trend + prediction (Dashboard B, TICKET-029 + WORK-005 anchor): a
 * selectable 3/12-month window with average spending, average saving
 * (income-aware — resolves TICKET-015), and a projected balance line
 * (BR-PRJ-2/3) anchored at the starting balance once set (BR-PRJ-2). */
export default function TrendView({
  figures,
  startingBalance = 0,
}: {
  figures: MonthlyFigure[]
  startingBalance?: number
}) {
  const [window, setWindow] = useState('3')
  const n = Number(window)

  const view = useMemo(() => {
    const slice = figures.slice(-n)
    const averages = windowAverages(figures, n)
    const history = cumulativeNet(slice, startingBalance)
    const anchor = history[history.length - 1]
    const projected: { month: string; balance: number }[] = []
    if (anchor) {
      let balance = anchor.balance
      const month = slice[slice.length - 1].month
      projected.push({ month: monthLabel(month), balance: round2(balance) })
      for (let i = 0; i < n; i++) {
        balance += averages.avgSaving
        projected.push({
          month: nextMonthLabel(month, i + 1),
          balance: round2(balance),
        })
      }
    }
    return { averages, history, projected }
  }, [figures, n, startingBalance])

  const data = [
    ...view.history.map((h) => ({
      month: monthLabel(h.month),
      balance: round2(h.balance),
    })),
    ...view.projected.map((p) => ({ month: p.month, projected: p.balance })),
  ]

  return (
    <Box component="section" aria-label="trend view">
      <Stack gap="md">
        <Text fw={600} size="xl" c="gray.9">
          Trend
        </Text>
        <SegmentedControl
          value={window}
          onChange={setWindow}
          data={[
            { label: '3 months', value: '3' },
            { label: '12 months', value: '12' },
          ]}
          aria-label="trend window"
        />
        {figures.length < 3 ? (
          <Card withBorder padding="lg">
            <Text size="xs" c="gray.6" aria-label="projection">
              Need at least 3 months of history to project.
            </Text>
          </Card>
        ) : (
          <>
            <Card withBorder padding="lg">
              <Stack gap={4}>
                <Text size="sm" c="gray.7">
                  Avg spending {formatMoney(view.averages.avgSpend)}/mo · Avg
                  saving {formatMoney(view.averages.avgSaving)}/mo
                </Text>
                <Text size="xs" c="gray.6" fs="italic">
                  Last {view.averages.months} months. Saving = income −
                  spending.
                </Text>
              </Stack>
            </Card>
            <Card withBorder padding="lg">
              <Text size="sm" fw={600} c="gray.7" mb="sm">
                Balance, actual and projected
              </Text>
              <LineChart
                h={180}
                data={data}
                dataKey="month"
                series={[
                  { name: 'balance', color: '#ea580c' },
                  {
                    name: 'projected',
                    color: '#9a3412',
                    strokeDasharray: '6 6',
                  },
                ]}
                tickLine="y"
                gridAxis="y"
                valueFormatter={(v) => `€${v}`}
              />
              <Text size="xs" c="gray.6" fs="italic" mt="xs">
                Projection continues the average saving of{' '}
                {formatMoney(view.averages.avgSaving)}/mo
                {startingBalance !== 0
                  ? `, starting from your ${formatMoney(startingBalance)} balance`
                  : ''}
                .
              </Text>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  )
}
