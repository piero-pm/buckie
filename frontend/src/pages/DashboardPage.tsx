import { useMemo, useState } from 'react'
import { Box, Card, Select, Stack, Text } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import type { Expense, Recurring } from '../domain/expense'
import type { IncomeSource } from '../domain/income'
import {
  expandRecurring,
  monthlyExpenses,
  monthTotal,
  monthIncome,
  ym,
} from '../domain/aggregation'
import {
  expectedSpend,
  monthFunnel,
  monthlyFigures,
} from '../domain/prediction'
import DashboardSummary from './DashboardSummary'
import CategoryDonut from './CategoryDonut'
import MonthBenchmark from './MonthBenchmark'
import SpendFunnel from './SpendFunnel'
import TrendView from './TrendView'

interface Props {
  expenses: Expense[]
  recurring: Recurring[]
  incomes: IncomeSource[]
}

const currentMonth = () => ym(new Date())

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

/** Month view (Dashboard A, WORK-003): totals, category donut, 3-month
 * expected-spend benchmark and the spend funnel (TICKET-028), then the
 * 3/12-month trend + prediction (TICKET-029, replaces the old text-only
 * projection). Rendered inside the home scroll (BR-HOME-2); all aggregation
 * runs client-side over decrypted records. */
export default function DashboardPage({ expenses, recurring, incomes }: Props) {
  const [selected, setSelected] = useState(currentMonth())

  const figures = useMemo(
    () => monthlyFigures(expenses, recurring, incomes, currentMonth()),
    [expenses, recurring, incomes]
  )

  const months = useMemo(
    () =>
      figures
        .map((f) => ({ month: f.month, total: f.spend }))
        .sort((a, b) => (a.month < b.month ? -1 : 1)),
    [figures]
  )

  const expandedForSelected = useMemo(
    () => expandRecurring(recurring, selected),
    [recurring, selected]
  )
  const monthItems = useMemo(
    () => monthlyExpenses(expenses, expandedForSelected, selected),
    [expenses, expandedForSelected, selected]
  )
  const total = monthTotal(monthItems)
  const income = monthIncome(incomes, selected)
  const net = income - total
  const expected = useMemo(
    () => expectedSpend(figures, selected),
    [figures, selected]
  )
  const funnel = monthFunnel(monthItems, income)

  const barData = [...months]
    .reverse()
    .slice(0, 12)
    .map((m) => ({
      month: monthLabel(m.month),
      total: Math.round(m.total * 100) / 100,
    }))

  return (
    <Box component="section" aria-label="month view">
      <Stack gap="md">
        <Text fw={600} size="xl" c="gray.9">
          Month view
        </Text>

        <Select
          label="Month"
          id="month"
          data={[...months]
            .reverse()
            .map((m) => ({ value: m.month, label: monthLabel(m.month) }))}
          value={selected}
          onChange={(v) => v && setSelected(v)}
        />

        <DashboardSummary total={total} income={income} net={net} />

        <MonthBenchmark expected={expected} total={total} />

        <CategoryDonut monthItems={monthItems} />

        <SpendFunnel funnel={funnel} />

        {barData.length > 0 && (
          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="sm">
              Month-on-month
            </Text>
            <BarChart
              h={160}
              data={barData}
              dataKey="month"
              series={[{ name: 'total', color: '#ea580c' }]}
              tickLine="y"
              gridAxis="y"
              valueFormatter={(v) => `€${v}`}
            />
          </Card>
        )}

        <TrendView figures={figures} />
      </Stack>
    </Box>
  )
}
