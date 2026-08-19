import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import TrendView from './TrendView'
import { buildTrendRows } from '../components/chartData'
import { theme } from '../theme'
import type { MonthlyFigure } from '../domain/prediction'

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="light">
      {ui}
    </MantineProvider>
  )
}

const figures: MonthlyFigure[] = [
  { month: '2026-06', spend: 1000, income: 2000, net: 1000 },
  { month: '2026-07', spend: 1200, income: 2000, net: 800 },
  { month: '2026-08', spend: 800, income: 2000, net: 1200 },
]

describe('Trend view (BR-PRJ-2/3, TICKET-029)', () => {
  // EX-PRJ-2: averages + projection render for a selectable window.
  it('shows averages and the projection with 3+ months', () => {
    renderWithMantine(<TrendView figures={figures} />)
    expect(screen.getByRole('region', { name: 'trend view' })).toBeDefined()
    expect(screen.getByText(/avg spending/i)).toBeDefined()
    expect(screen.getByText(/avg saving/i)).toBeDefined()
  })

  it('switches the window via the segmented control', () => {
    renderWithMantine(<TrendView figures={figures} />)
    fireEvent.click(screen.getByRole('radio', { name: '12 months' }))
    // only 3 months of history exist, so the basis says 3
    expect(screen.getByText(/last 3 months/i)).toBeDefined()
  })

  // EX-PRJ-3: guidance text instead of projections with < 3 months.
  it('shows guidance with fewer than 3 months', () => {
    renderWithMantine(<TrendView figures={figures.slice(0, 2)} />)
    expect(screen.getByText(/need at least 3 months/i)).toBeDefined()
  })
})

describe('buildTrendRows (BR-VI-11)', () => {
  const history = [
    { month: 'Jun 26', balance: 1000 },
    { month: 'Jul 26', balance: 1800 },
    { month: 'Aug 26', balance: 3000 },
  ]
  const projected = [
    { month: 'Aug 26', balance: 3000 }, // anchor repeat from the projection
    { month: 'Sep 26', balance: 3800 },
    { month: 'Oct 26', balance: 4600 },
  ]

  it('emits one row per month — no duplicated boundary tick', () => {
    const rows = buildTrendRows(history, projected)
    const months = rows.map((r) => r.month)
    expect(new Set(months).size).toBe(months.length)
    expect(months).toEqual(['Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26'])
  })

  it('meets the lines at the anchor: actual and projected share the row', () => {
    const rows = buildTrendRows(history, projected)
    expect(rows[2]).toEqual({ month: 'Aug 26', balance: 3000, projected: 3000 })
    expect(rows[3]).toEqual({ month: 'Sep 26', projected: 3800 })
  })

  it('returns history untouched when there is no projection', () => {
    const rows = buildTrendRows(history, [])
    expect(rows).toHaveLength(3)
    expect(rows[2].projected).toBeUndefined()
  })
})
