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

/** Sankey month flow (BR-SANK-1, TICKET-040): income splitting into fixed
 * costs, the expected buckets, other spend, and saved — replacing the old
 * funnel. recharts Sankey used directly (human-approved interface
 * exception, work-state-005 §2); kept on Mantine Card chrome. */
export default function SankeyFlow({ flows }: { flows: MonthFlows }) {
  if (flows.links.length === 0) {
    return (
      <Card withBorder padding="lg">
        <Text size="sm" c="gray.5" aria-label="sankey">
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
                link={{ stroke: '#fdba74', fill: '#fdba74', fillOpacity: 0.5 }}
                node={(props: NodeProps) => <FlowNode {...props} />}
                margin={{ top: 4, right: 120, bottom: 4, left: 8 }}
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
  payload: { name?: string }
}

/** Node rectangle + right-side label (recharts' default node has no text). */
function FlowNode({ x, y, width, height, index, payload }: NodeProps) {
  const name = payload?.name ?? ''
  return (
    <Layer key={`node-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#ea580c"
        fillOpacity="1"
      />
      <text
        x={x + width + 6}
        y={y + height / 2 + 4}
        fontSize={12}
        fill="#343a40"
      >
        {name}
      </text>
    </Layer>
  )
}
