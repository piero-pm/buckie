import { useMemo, useState } from 'react'
import { Box, Card, SegmentedControl, Stack, Text } from '@mantine/core'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyFigure } from '../domain/prediction'
import { cumulativeNet, windowAverages } from '../domain/prediction'
import { formatMoney, formatMoneyCompact } from '../domain/settings'
import { buildTrendRows } from '../components/chartData'
import { tokens } from '../theme/tokens'

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
 * (BR-PRJ-2/3) anchored at the starting balance once set (BR-PRJ-2).
 * BR-VI-11 re-theme: solid actual line, dashed + dimmer projected line,
 * shaded projection band, single "today" boundary. recharts ComposedChart
 * used directly (human-approved interface exception, WORK-008 §2 — the
 * shaded band needs ReferenceArea). */
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

  const rows = buildTrendRows(
    view.history.map((h) => ({
      month: monthLabel(h.month),
      balance: h.balance,
    })),
    view.projected
  )
  const bandStart = rows.find((r) => r.projected !== undefined)?.month
  const bandEnd = rows[rows.length - 1]?.month

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
              <ResponsiveContainer width="100%" height={190}>
                <ComposedChart
                  data={rows}
                  margin={{ top: 8, right: 10, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--line)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--line)' }}
                    tick={{ fontSize: 10, fill: 'var(--ink-soft)' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    tick={{ fontSize: 10, fill: 'var(--ink-soft)' }}
                    tickFormatter={(v: number) => formatMoneyCompact(v)}
                  />
                  <Tooltip
                    formatter={(v: number, name: string) => [
                      formatMoney(v),
                      name === 'projected' ? 'projected' : 'actual',
                    ]}
                    contentStyle={{
                      background: 'var(--paper-deep)',
                      border: '1px solid var(--line)',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  />
                  {bandStart && bandEnd && bandStart !== bandEnd && (
                    <ReferenceArea
                      x1={bandStart}
                      x2={bandEnd}
                      fill={tokens.rust}
                      fillOpacity={0.05}
                      stroke="none"
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke={tokens.rust}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke={tokens.rustDeep}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                    strokeOpacity={0.75}
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
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
