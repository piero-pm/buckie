import { useMemo, useState } from 'react'
import { Box, Card, Select, Stack, Text } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import type { Expense, Recurring } from '../domain/expense'
import type { IncomeSource } from '../domain/income'
import type { IncomeEvent } from '../domain/incomeEvent'
import type { Expectations } from '../domain/expectations'
import { compareBuckets } from '../domain/comparison'
import {
  expandRecurring,
  monthlyExpenses,
  monthTotal,
  withCurrentMonth,
  ym,
} from '../domain/aggregation'
import { monthIncome } from '../domain/income-month'
import { categoryTrends, dailyTotals } from '../domain/insights'
import { expectedSpend, monthlyFigures } from '../domain/prediction'
import { monthFlows } from '../domain/flows'
import DashboardSummary from './DashboardSummary'
import CategoryDonut from './CategoryDonut'
import MonthBenchmark from './MonthBenchmark'
import TrendView from './TrendView'
import ExpectedVsActual from '../components/ExpectedVsActual'
import SavedBar from '../components/SavedBar'
import MonthExpenseList from '../components/MonthExpenseList'
import SankeyFlow from '../components/SankeyFlow'
import HeatmapCard from '../components/HeatmapCard'
import CategoryTrendCard from '../components/CategoryTrendCard'

interface Props {
  expenses: Expense[]
  recurring: Recurring[]
  incomes: IncomeSource[]
  incomeEvents: IncomeEvent[]
  expectations: Expectations | null
}

const currentMonth = () => ym(new Date())

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

/** Month view + trend (BR-DASH-1, WORK-005): totals, saved bar, 3-month
 * benchmark, expected vs actual (BR-CMP-1), donut and month-on-month, then
 * the 3/12-month trend + prediction, and this month's expense list last.
 * All aggregation runs client-side over decrypted records. */
export default function DashboardPage({
  expenses,
  recurring,
  incomes,
  incomeEvents,
  expectations,
}: Props) {
  const [selected, setSelected] = useState(currentMonth())

  const figures = useMemo(
    () =>
      monthlyFigures(
        expenses,
        recurring,
        incomes,
        currentMonth(),
        incomeEvents
      ),
    [expenses, recurring, incomes, incomeEvents]
  )

  const months = useMemo(
    () =>
      figures
        .map((f) => ({ month: f.month, total: f.spend }))
        .sort((a, b) => (a.month < b.month ? -1 : 1)),
    [figures]
  )

  const monthOptions = useMemo(
    () =>
      withCurrentMonth(
        months.map((m) => m.month),
        currentMonth()
      )
        .reverse()
        .map((m) => ({ value: m, label: monthLabel(m) })),
    [months]
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
  const income = monthIncome(incomes, selected, incomeEvents)
  const net = income - total
  const expected = useMemo(
    () => expectedSpend(figures, selected),
    [figures, selected]
  )
  const flows = monthFlows(monthItems, income)
  const comparison = useMemo(
    () => compareBuckets(monthItems, expectations?.expected ?? {}),
    [monthItems, expectations]
  )
  // Insights (WORK-006 S3): trailing-year calendar + category trends run on
  // all history through the current month, not the selected month.
  const heatmapData = useMemo(
    () => dailyTotals(expenses, recurring, currentMonth()),
    [expenses, recurring]
  )
  const trendRows = useMemo(
    () => categoryTrends(expenses, recurring, currentMonth()),
    [expenses, recurring]
  )

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
          data={monthOptions}
          value={selected}
          onChange={(v) => v && setSelected(v)}
        />

        <DashboardSummary total={total} income={income} net={net} />

        <SavedBar income={income} spend={total} />

        <MonthBenchmark expected={expected} total={total} />

        <ExpectedVsActual rows={comparison} />

        <CategoryDonut monthItems={monthItems} />

        <SankeyFlow flows={flows} />

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

        <TrendView
          figures={figures}
          startingBalance={expectations?.startingBalance ?? 0}
        />

        <MonthExpenseList items={monthItems} />

        <HeatmapCard data={heatmapData} />

        <CategoryTrendCard rows={trendRows} />
      </Stack>
    </Box>
  )
}
