import { describe, it, expect } from 'vitest'
import { monthFlows } from './flows'
import type { Expense } from './expense'

const item = (
  id: string,
  amount: number,
  category: string,
  date = '2026-08-01'
): Expense => ({
  id,
  amount,
  category: category as Expense['category'],
  date,
  createdAt: date,
})

describe('monthFlows (BR-SANK-1, WORK-005)', () => {
  it('splits income into groups, other, and saved (EX-EA-5)', () => {
    const flows = monthFlows(
      [
        item('r', 800, 'Rent'),
        item('b', 200, 'Bills'),
        item('g', 300, 'Groceries'),
        item('t', 100, 'Transport & Travel'),
      ],
      1500
    )
    expect(flows.nodes[0].name).toBe('Income')
    const names = flows.nodes.map((n) => n.name)
    expect(names).toContain('Rent')
    expect(names).toContain('Groceries')
    expect(names).toContain('Other spend')
    expect(names).toContain('Saved')
    const saved = flows.links.find(
      (l) => flows.nodes[l.target].name === 'Saved'
    )
    expect(saved?.value).toBe(100) // 1500 - 1400
    const total = flows.links.reduce((s, l) => s + l.value, 0)
    expect(total).toBe(1500) // income fully distributed
  })

  it('omits zero-flow groups and a negative saving', () => {
    const flows = monthFlows(
      [item('g', 500, 'Groceries'), item('f', 50, 'Food')],
      300
    )
    const names = flows.nodes.map((n) => n.name)
    expect(names).not.toContain('Rent')
    expect(names).not.toContain('Saved') // over-spending: no saved flow
    expect(
      flows.links.find((l) => flows.nodes[l.target].name === 'Groceries')?.value
    ).toBe(550) // legacy Food approximates into groceries
  })

  it('returns no links for an empty month', () => {
    expect(monthFlows([], 0)).toEqual({
      nodes: [{ name: 'Income' }],
      links: [],
    })
  })
})
