/**
 * Pure chart-data helpers (WORK-008 S2): shared by MonthBars and TrendView
 * and unit-tested directly. Lives outside the component files so react
 * fast-refresh keeps working (eslint react-refresh/only-export-components).
 */

export interface MonthBar {
  month: string
  total: number
}

/** Even-increment axis ticks (BR-VI-10): 0..ceil(max) stepped to a "nice"
 * 1/2/5×10ⁿ interval so the scale never ends mid-step. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 100]
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.01; v += step) {
    ticks.push(Math.round(v * 100) / 100)
  }
  return ticks
}

export interface TrendRow {
  month: string
  balance?: number
  projected?: number
}

/** One row per month label: the anchor month carries BOTH the actual
 * balance and the projected value so the two lines meet at "today"
 * without a duplicated x tick (BR-VI-11). */
export function buildTrendRows(
  history: { month: string; balance: number }[],
  projected: { month: string; balance: number }[]
): TrendRow[] {
  const rows: TrendRow[] = history.map((h) => ({
    month: h.month,
    balance: round2(h.balance),
  }))
  if (rows.length === 0 || projected.length === 0) return rows
  rows[rows.length - 1].projected = round2(projected[0].balance)
  for (const p of projected.slice(1)) {
    rows.push({ month: p.month, projected: round2(p.balance) })
  }
  return rows
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}
