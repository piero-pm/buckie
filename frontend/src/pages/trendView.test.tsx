import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { describe, it, expect } from 'vitest'
import TrendView from './TrendView'
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
