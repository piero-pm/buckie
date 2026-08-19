import { useMemo, useState } from 'react'
import { Card, MultiSelect, Stack, Text } from '@mantine/core'
import { LineChart } from '@mantine/charts'
import { BUCKETS, CATEGORIES } from '../domain/taxonomy'
import { formatMoney } from '../domain/settings'
import { BUCKET_COLORS, categoryColor } from '../theme/palette'

const BUCKET_KEYS = BUCKETS.map((b) => `b:${b}`)

// Fixed identity colors (BR-VI-13): buckets and categories keep their
// color regardless of selection order or view.
const colorFor = (key: string) =>
  key.startsWith('b:')
    ? BUCKET_COLORS[key.slice(2) as (typeof BUCKETS)[number]]
    : categoryColor(key)

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

/** Per-category 12-month trend card (BR-TRD-1, TICKET-048): multi-select of
 * buckets (default, rolled up incl. legacy) or individual categories. */
export default function CategoryTrendCard({
  rows,
}: {
  rows: Record<string, number | string>[]
}) {
  const [selected, setSelected] = useState<string[]>(BUCKET_KEYS)

  const data = useMemo(
    () => rows.map((r) => ({ ...r, label: monthLabel(String(r.month)) })),
    [rows]
  )
  const series = selected.map((key) => ({
    name: key,
    color: colorFor(key),
    label: key.replace(/^b:/, ''),
  }))

  return (
    <Card withBorder padding="lg">
      <Stack gap="xs">
        <Text size="sm" fw={600} c="gray.7">
          Category trends, last 12 months
        </Text>
        <MultiSelect
          label="Show"
          id="trend-select"
          data={[
            {
              group: 'Buckets',
              items: BUCKET_KEYS.map((k) => ({
                value: k,
                label: k.replace(/^b:/, ''),
              })),
            },
            {
              group: 'Categories',
              items: CATEGORIES.map((c) => ({ value: c, label: c })),
            },
          ]}
          value={selected}
          onChange={setSelected}
        />
        {series.length > 0 && rows.length > 0 ? (
          <LineChart
            h={200}
            data={data}
            dataKey="label"
            series={series}
            tickLine="y"
            gridAxis="y"
            valueFormatter={(v) => formatMoney(Number(v))}
          />
        ) : (
          <Text size="sm" c="gray.6" py="xs">
            Record expenses to see trends.
          </Text>
        )}
        <Text size="xs" c="gray.6" fs="italic">
          Buckets roll old categories in; months without data count as zero.
        </Text>
      </Stack>
    </Card>
  )
}
