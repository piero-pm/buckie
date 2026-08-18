import { Box, Card, Stack, Text } from '@mantine/core'
import { formatEUR } from '../domain/taxonomy'

const SHADES = ['#fff7ed', '#fed7aa', '#fb923c', '#ea580c'] as const
const CELL = 12
const GAP = 2
const LABEL_H = 14

interface DayCell {
  date: string
  value: number | null
  col: number
  row: number
  /** Month name rendered above this cell's column when a month starts. */
  monthLabel?: string
}

/**
 * Spend-calendar card (BR-HMAP-1, TICKET-047): trailing 12 months of daily
 * spend totals as an SVG heatmap, darker = more. @mantine/charts 7.17.8
 * ships no public Heatmap export, so the calendar is drawn here directly.
 */
export default function HeatmapCard({
  data,
}: {
  data: Record<string, number>
}) {
  const hasData = Object.keys(data).length > 0
  const { cells, weeks } = buildCells(data, new Date())
  const width = weeks * (CELL + GAP) + 2
  const height = 7 * (CELL + GAP) + LABEL_H + 2
  const max = maxValue(data)

  return (
    <Card withBorder padding="lg">
      <Stack gap="xs">
        <Text size="sm" fw={600} c="gray.7">
          When the money leaves
        </Text>
        {hasData ? (
          <Box style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <svg
              role="img"
              aria-label="spend calendar, last 12 months"
              width={width}
              height={height}
            >
              {cells.map((c) => (
                <rect
                  key={c.date}
                  x={c.col * (CELL + GAP) + 1}
                  y={c.row * (CELL + GAP) + LABEL_H}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={colorFor(c.value, max)}
                >
                  <title>
                    {c.date}
                    {c.value !== null ? ` · ${formatEUR(c.value)}` : ''}
                  </title>
                </rect>
              ))}
              {cells
                .filter((c) => c.monthLabel)
                .map((c) => (
                  <text
                    key={`l-${c.date}`}
                    x={c.col * (CELL + GAP) + 1}
                    y={LABEL_H - 3}
                    fontSize={9}
                    fill="#868e96"
                  >
                    {c.monthLabel}
                  </text>
                ))}
            </svg>
          </Box>
        ) : (
          <Text size="sm" c="gray.5" py="xs">
            Record expenses to see your calendar fill in.
          </Text>
        )}
      </Stack>
    </Card>
  )
}

/** Grid coordinates + month labels for the trailing-year calendar. */
function buildCells(data: Record<string, number>, today: Date) {
  const cells: DayCell[] = []
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1)
  // Align back to Monday so weeks are whole columns (rows run Mon..Sun).
  const monday = new Date(start)
  monday.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const weeks = Math.ceil((dayDiff(monday, today) + 1) / 7)
  for (let i = 0; i < weeks; i++) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i * 7 + row)
      if (d > today) continue
      const key = toKey(d)
      const cell: DayCell = {
        date: key,
        value: key in data ? data[key] : null,
        col: i,
        row,
      }
      if (d.getDate() === 1) cell.monthLabel = shortMonth(d)
      cells.push(cell)
    }
  }
  return { cells, weeks }
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortMonth(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short' })
}

function maxValue(data: Record<string, number>): number {
  return Math.max(1, ...Object.values(data))
}

function colorFor(value: number | null, max: number): string {
  if (value === null || value <= 0) return SHADES[0]
  const ratio = value / max
  if (ratio > 0.75) return SHADES[3]
  if (ratio > 0.5) return SHADES[2]
  if (ratio > 0.25) return SHADES[1]
  return SHADES[0]
}
