import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, formatMoneyCompact } from '../domain/settings'
import { niceTicks, type MonthBar } from './chartData'
import { tokens } from '../theme/tokens'

/** Month-on-month spend bars (BR-VI-10). recharts used directly
 * (human-approved interface exception, WORK-008 §2 — @mantine/charts
 * BarChart cannot render bar data labels or fixed ticks): rust bars, data
 * labels, mono axes, currency-aware formatting. */
export default function MonthBars({ data }: { data: MonthBar[] }) {
  const max = Math.max(0, ...data.map((d) => d.total))
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke="var(--line)"
          strokeDasharray="3 3"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={{ stroke: 'var(--line)' }}
          tick={{ fontSize: 10, fill: 'var(--ink-soft)' }}
          interval={0}
          angle={data.length > 8 ? -35 : 0}
          textAnchor={data.length > 8 ? 'end' : 'middle'}
          height={data.length > 8 ? 36 : 24}
        />
        <YAxis
          ticks={niceTicks(max)}
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 10, fill: 'var(--ink-soft)' }}
          tickFormatter={(v: number) => formatMoneyCompact(v)}
        />
        <Tooltip
          cursor={{ fill: 'var(--paper-deep)' }}
          formatter={(v: number) => formatMoney(v)}
          contentStyle={{
            background: 'var(--paper-deep)',
            border: '1px solid var(--line)',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="total"
          fill={tokens.rust}
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="total"
            position="top"
            fontSize={9}
            fill="var(--ink-soft)"
            formatter={(v: number) => formatMoneyCompact(v)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
