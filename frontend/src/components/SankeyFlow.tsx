import { Card, Stack, Text } from '@mantine/core'
import {
  ResponsiveContainer,
  Sankey as RechartsSankey,
  Tooltip,
  Layer,
  Rectangle,
} from 'recharts'
import type { MonthFlows } from '../domain/flows'
import { formatMoney } from '../domain/settings'
import { categoryColor } from '../theme/palette'
import { tokens } from '../theme/tokens'

// Node colors (BR-VI-9): category nodes use their stable palette color;
// non-category nodes get identity anchors — Saved reads vault-green so the
// spend/saved split is legible at a glance, not just by label.
const NODE_COLORS: Record<string, string> = {
  Income: tokens.ink,
  'Other spend': '#6B2E10',
  Saved: tokens.vaultGreen,
  'Going out': '#A8511F',
  Shopping: '#E8A366',
}
const nodeColor = (name: string) => NODE_COLORS[name] ?? categoryColor(name)

/** Sankey month flow (BR-SANK-1, TICKET-040; BR-VI-9 re-theme): income
 * splitting into fixed costs, the expected buckets, other spend, and
 * saved. recharts Sankey used directly (human-approved interface
 * exception, work-state-005 §2) with custom links so each flow takes its
 * target node's color at readable opacity, and node labels carry values. */
export default function SankeyFlow({ flows }: { flows: MonthFlows }) {
  if (flows.links.length === 0) {
    return (
      <Card withBorder padding="lg">
        <Text size="sm" c="gray.6" aria-label="sankey">
          Nothing to show yet for this month.
        </Text>
      </Card>
    )
  }
  return (
    <Card withBorder padding="lg">
      <Stack gap="sm">
        <Text size="sm" fw={600} c="gray.7">
          Where your money went
        </Text>
        <div
          style={{ width: '100%', overflowX: 'auto' }}
          role="img"
          aria-label="month flow sankey"
        >
          <div style={{ minWidth: 480, height: 280 }}>
            <ResponsiveContainer>
              <RechartsSankey
                data={flows}
                nodeWidth={12}
                nodePadding={14}
                linkCurvature={0.5}
                link={(props: LinkProps) => <FlowLink {...props} />}
                node={(props: NodeProps) => <FlowNode {...props} />}
                margin={{ top: 4, right: 130, bottom: 4, left: 8 }}
              >
                <Tooltip formatter={(v: number) => formatMoney(v)} />
              </RechartsSankey>
            </ResponsiveContainer>
          </div>
        </div>
      </Stack>
    </Card>
  )
}

interface NodeProps {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name?: string; value?: number }
}

/** Node rectangle in its identity color + right-side label; right-side
 * (target) nodes show the flow value inline (BR-VI-9) instead of
 * requiring hover. */
function FlowNode({ x, y, width, height, index, payload }: NodeProps) {
  const name = payload?.name ?? ''
  const value = typeof payload?.value === 'number' ? payload.value : null
  const showValue = index !== 0 && value !== null
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeColor(name)}
        fillOpacity="1"
      />
      <text
        x={x + width + 6}
        y={y + height / 2 + 4}
        fontSize={12}
        fill="var(--ink)"
      >
        {name}
        {showValue && value !== null && (
          <tspan
            fontFamily="var(--font-mono)"
            fontSize={11}
            fill="var(--ink-soft)"
          >
            {' '}
            · {formatMoney(value)}
          </tspan>
        )}
      </text>
    </Layer>
  )
}

interface LinkProps {
  sourceX: number
  sourceY: number
  sourceControlX: number
  targetX: number
  targetY: number
  targetControlX: number
  linkWidth: number
  payload: { source: { name?: string }; target: { name?: string } }
}

/** Flow ribbon in the target node's color at readable opacity (BR-VI-9:
 * contrast was an accessibility problem at the old pale-orange 0.5). */
function FlowLink({
  sourceX,
  sourceY,
  sourceControlX,
  targetX,
  targetY,
  targetControlX,
  linkWidth,
  payload,
}: LinkProps) {
  const color = nodeColor(payload?.target?.name ?? '')
  return (
    <path
      d={`
        M${sourceX},${sourceY}
        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        L${targetX},${targetY + linkWidth}
        C${targetControlX},${targetY + linkWidth} ${sourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
        Z`}
      fill={color}
      fillOpacity={0.65}
      stroke="none"
    />
  )
}
