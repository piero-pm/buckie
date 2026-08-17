import type { Expense } from './expense'
import { monthTotal } from './aggregation'

/** Sankey groups (BR-SANK-1, WORK-005): fixed costs stay separate, the four
 * expected buckets flow beside them, everything else lands in Other spend.
 * Legacy categories approximate as in comparison.ts (Food -> Groceries,
 * Entertainment & Subscriptions -> Going out). */
const FLOW_GROUPS: { node: string; categories: string[] }[] = [
  { node: 'Rent', categories: ['Rent'] },
  { node: 'Bills', categories: ['Bills'] },
  { node: 'Insurance', categories: ['Insurance'] },
  { node: 'Groceries', categories: ['Groceries', 'Food'] },
  {
    node: 'Going out',
    categories: [
      'Restaurants & drinks',
      'Entertainment & culture',
      'Entertainment & Subscriptions',
    ],
  },
  { node: 'Shopping', categories: ['Shopping & clothes', 'Shopping'] },
  { node: 'Subscriptions', categories: ['Subscriptions'] },
]

export interface FlowNode {
  name: string
}

export interface FlowLink {
  source: number
  target: number
  value: number
}

export interface MonthFlows {
  nodes: FlowNode[]
  links: FlowLink[]
}

/** Builds the month's income flow for the sankey: income splits into the
 * spend groups above, Other spend, and Saved (income − spend). Zero-flow
 * groups are omitted; a negative saving omits Saved (EX-EA-5). */
export function monthFlows(monthItems: Expense[], income: number): MonthFlows {
  const nodes: FlowNode[] = [{ name: 'Income' }]
  const links: FlowLink[] = []
  let groupedSpend = 0
  for (const group of FLOW_GROUPS) {
    const cats = new Set(group.categories)
    const total = round(
      monthItems
        .filter((e) => cats.has(e.category))
        .reduce((s, e) => s + e.amount, 0)
    )
    groupedSpend += total
    if (total > 0) {
      const target = nodes.push({ name: group.node }) - 1
      links.push({ source: 0, target, value: total })
    }
  }
  const other = round(monthTotal(monthItems) - groupedSpend)
  if (other > 0) {
    const target = nodes.push({ name: 'Other spend' }) - 1
    links.push({ source: 0, target, value: other })
  }
  const saved = round(income - monthTotal(monthItems))
  if (saved > 0) {
    const target = nodes.push({ name: 'Saved' }) - 1
    links.push({ source: 0, target, value: saved })
  }
  return { nodes, links }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
