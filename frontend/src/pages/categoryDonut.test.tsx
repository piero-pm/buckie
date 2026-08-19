import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import CategoryDonut from './CategoryDonut'
import { theme } from '../theme'
import type { Expense } from '../domain/expense'
import { categoryColor } from '../theme/palette'

const item = (
  id: string,
  category: Expense['category'],
  amount: number
): Expense => ({
  id,
  amount,
  category,
  date: '2026-08-10',
  createdAt: '2026-08-10T10:00:00Z',
})

const items = [item('a', 'Rent', 750), item('b', 'Groceries', 250)]

// BR-VI-8: stable palette colors, percent of total, 1:1 swatches.
describe('CategoryDonut (BR-VI-8)', () => {
  it('shows percent of total next to each amount', () => {
    render(
      <MantineProvider theme={theme}>
        <CategoryDonut monthItems={items} />
      </MantineProvider>
    )
    expect(screen.getByText('75%')).toBeDefined()
    expect(screen.getByText('25%')).toBeDefined()
    expect(screen.getByText('€750.00')).toBeDefined()
    expect(screen.getByText('€250.00')).toBeDefined()
  })

  it('colors each category from the stable palette map', () => {
    const { container } = render(
      <MantineProvider theme={theme}>
        <CategoryDonut monthItems={items} />
      </MantineProvider>
    )
    // Mantine's bg prop renders hex as rgb() — compare in that form.
    const rgb = (hex: string) => {
      const n = parseInt(hex.slice(1), 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }
    for (const name of ['Rent', 'Groceries']) {
      expect(container.innerHTML).toContain(rgb(categoryColor(name)))
    }
  })
})
