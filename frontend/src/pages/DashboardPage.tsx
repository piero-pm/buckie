import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Select,
  Stack,
  Text,
} from '@mantine/core'
import { DonutChart, BarChart } from '@mantine/charts'
import { IconArrowLeft } from '@tabler/icons-react'
import type { Expense, Recurring } from '../domain/expense'
import {
  expandRecurring,
  monthlyExpenses,
  monthTotal,
  byCategory,
  projectSavings,
  ym,
} from '../domain/aggregation'
import { formatEUR } from '../domain/taxonomy'

interface Props {
  expenses: Expense[]
  recurring: Recurring[]
  onBack: () => void
}

const currentMonth = () => ym(new Date())

// Stable category colours so the donut is consistent across months.
const COLORS = [
  '#4f66fc',
  '#8fa2ff',
  '#6e84fd',
  '#b8c4ff',
  '#2842b5',
  '#354ecb',
  '#3f59e0',
  '#5a70fc',
]

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

/** Month-on-month totals, spend-by-category, and a savings projection
 * (TICKET-013/014/015). All aggregation runs client-side over decrypted
 * records; the server only ever saw ciphertext. */
export default function DashboardPage({ expenses, recurring, onBack }: Props) {
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
  const breakdown = byCategory(monthItems).filter((c) => c.total > 0)
  const projection = useMemo(() => projectSavings(months), [months])

  const donutData = breakdown.map((c, i) => ({
    name: c.category,
    value: Math.round(c.total * 100) / 100,
    color: COLORS[i % COLORS.length],
  }))
  const barData = [...months]
    .reverse()
    .slice(0, 12)
    .map((m) => ({
      month: monthLabel(m.month),
      total: Math.round(m.total * 100) / 100,
    }))

  return (
    <Box component="main" aria-label="dashboard">
      <Container size={560} px="md" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} size="xl" c="gray.9">
              Dashboard
            </Text>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>

          <Select
            label="Month"
            id="month"
            data={[...months]
              .reverse()
              .map((m) => ({ value: m.month, label: monthLabel(m.month) }))}
            value={selected}
            onChange={(v) => v && setSelected(v)}
          />

          <Card withBorder padding="lg">
            <Text size="xs" c="gray.5" tt="uppercase" fw={600}>
              Total this month
            </Text>
            <Text
              size="2rem"
              fw={700}
              c="gray.9"
              mt={4}
              aria-label="month total"
            >
              {formatEUR(total)}
            </Text>
          </Card>

          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="sm">
              By category
            </Text>
            {donutData.length === 0 ? (
              <Text size="sm" c="gray.5">
                No spend recorded this month.
              </Text>
            ) : (
              <Group align="center" gap="lg" grow wrap="nowrap">
                <DonutChart data={donutData} strokeWidth={1} size={160} />
                <Stack gap={6}>
                  {donutData.map((d) => (
                    <Group key={d.name} gap="xs">
                      <Box
                        w={10}
                        h={10}
                        bg={d.color}
                        style={{ borderRadius: 2 }}
                      />
                      <Text size="xs" c="gray.7" flex={1}>
                        {d.name}
                      </Text>
                      <Text size="xs" fw={600} c="gray.9">
                        {formatEUR(d.value)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Group>
            )}
          </Card>

          {barData.length > 0 && (
            <Card withBorder padding="lg">
              <Text size="sm" fw={600} c="gray.7" mb="sm">
                Month-on-month
              </Text>
              <BarChart
                h={160}
                data={barData}
                dataKey="month"
                series={[{ name: 'total', color: '#4f66fc' }]}
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
      </Container>
    </Box>
  )
}
