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
  projectSavings,
  ym,
} from '../domain/aggregation'
import { formatEUR } from '../domain/taxonomy'
import DashboardSummary from './DashboardSummary'
import CategoryDonut from './CategoryDonut'

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

/** Month view (Dashboard A, WORK-003): month-on-month totals, spend by
 * category, income + net (TICKET-022), and a savings projection
 * (TICKET-013/014/015). Rendered inside the home scroll (BR-HOME-2); all
 * aggregation runs client-side over decrypted records. */
export default function DashboardPage({ expenses, recurring, incomes }: Props) {
  const [selected, setSelected] = useState(currentMonth())

  const months = useMemo(() => {
    const expanded = expandRecurring(recurring, currentMonth())
    const all = [...expenses, ...expanded]
    const totals = new Map<string, number>()
    for (const e of all) {
      const m = ym(e.date)
      totals.set(m, (totals.get(m) ?? 0) + e.amount)
    }
    return [...totals.entries()]
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => (a.month < b.month ? -1 : 1))
  }, [expenses, recurring])

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
  const projection = useMemo(() => projectSavings(months), [months])

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

        <CategoryDonut monthItems={monthItems} />

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

        <Card withBorder padding="lg">
          <Text size="sm" fw={600} c="gray.7" mb="xs">
            Savings projection
          </Text>
          {projection.hasData ? (
            <Stack gap={4}>
              <Text size="xs" c="gray.5" aria-label="projection">
                Next month ~{formatEUR(projection.nextMonthEstimate ?? 0)}; at
                this rate ~{formatEUR(projection.yearlyIfContinued ?? 0)} over
                12 months.
              </Text>
              <Text size="xs" c="gray.5" fs="italic">
                Estimate. {projection.basis}
              </Text>
            </Stack>
          ) : (
            <Text size="xs" c="gray.5" aria-label="projection">
              {projection.basis}
            </Text>
          )}
        </Card>
      </Stack>
    </Box>
  )
}
