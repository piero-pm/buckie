import { Box, Container, Grid, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle, IconLock } from '@tabler/icons-react'
import { categoryColor } from '../../theme/palette'

// Illustrative only (BR-VI-4): real category names and the stable palette,
// clearly labeled as example data — the operator can't see real numbers,
// so nothing here may read like a live account.
const EXAMPLE = {
  monthLabel: 'this month · august',
  total: '€1,482',
  categories: [
    { name: 'Rent', amount: 850.0 },
    { name: 'Groceries', amount: 312.4 },
    { name: 'Restaurants & drinks', amount: 186.7 },
    { name: 'Transport & Travel', amount: 94.2 },
    { name: 'Subscriptions', amount: 38.97 },
  ],
  spark: [1180, 1320, 1240, 1410, 1365, 1482],
  insight: 'At this rate, you\u2019re on track to save €6,800 this year.',
  caption: 'Example data — not a real account',
}

const fmt = (v: number) =>
  `€${v.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** 6-month sparkline (static SVG — no chart lib on the landing page). */
function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const w = 220
  const h = 56
  const xy = points.map((v, i) => {
    const x = (i / (points.length - 1)) * (w - 8) + 4
    const y = h - 6 - ((v - min) / (max - min || 1)) * (h - 14)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true">
      <polyline
        points={xy.join(' ')}
        fill="none"
        stroke="var(--vault-amber)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xy[xy.length - 1].split(',')[0]}
        cy={xy[xy.length - 1].split(',')[1]}
        r={3}
        fill="var(--vault-amber)"
      />
    </svg>
  )
}

/** Dashboard preview section (BR-VI-4): a dark card styled like the vault
 * widget showing what "real visibility" means — month total, category
 * breakdown with the app's real colors, trend, one insight line — with an
 * explicit example-data caption. */
export default function DashboardPreview() {
  const maxAmount = Math.max(...EXAMPLE.categories.map((c) => c.amount))
  return (
    <Box component="section" pb={{ base: 56, sm: 88 }}>
      <Container size={1120} px={{ base: 22, sm: 32 }}>
        <Text
          ff="var(--font-mono)"
          fz="0.75rem"
          tt="uppercase"
          lts="0.14em"
          c="var(--ink-soft)"
          mb={6}
        >
          the proof
        </Text>
        <Title order={2} fz="1.6rem" fw={600} mb={38}>
          What that visibility actually looks like
        </Title>
        <Box
          w="100%"
          style={{
            background: 'var(--vault-bg)',
            borderRadius: 10,
            padding: '26px 26px 22px',
            boxShadow: '0 24px 60px -20px rgba(42,35,28,0.45)',
          }}
        >
          <Group
            gap={9}
            pb={14}
            mb={18}
            style={{ borderBottom: '1px solid var(--vault-line)' }}
          >
            <Box
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--vault-amber)',
              }}
            />
            <Text
              ff="var(--font-mono)"
              fz="0.74rem"
              lts="0.04em"
              c="var(--vault-text)"
              opacity={0.6}
              flex={1}
            >
              your-vault.local · dashboard
            </Text>
            <IconLock size={13} color="var(--vault-amber)" opacity={0.8} />
          </Group>
          <Grid gutter={28}>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <Stack gap={14}>
                <Text
                  ff="var(--font-mono)"
                  fz="0.72rem"
                  tt="uppercase"
                  lts="0.1em"
                  c="var(--vault-text)"
                  opacity={0.6}
                >
                  {EXAMPLE.monthLabel}
                </Text>
                <Title
                  order={3}
                  c="var(--vault-text)"
                  fz="2.6rem"
                  fw={700}
                  lh={1}
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {EXAMPLE.total}
                </Title>
                <Sparkline points={EXAMPLE.spark} />
                <Text
                  ff="var(--font-mono)"
                  fz="0.8rem"
                  c="var(--vault-green-soft)"
                >
                  {EXAMPLE.insight}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <Stack gap={12} justify="center" style={{ height: '100%' }}>
                {EXAMPLE.categories.map((c) => (
                  <Box key={c.name}>
                    <Group justify="space-between" mb={4}>
                      <Text
                        ff="var(--font-mono)"
                        fz="0.78rem"
                        c="var(--vault-text)"
                        opacity={0.85}
                      >
                        {c.name}
                      </Text>
                      <Text
                        ff="var(--font-mono)"
                        fz="0.78rem"
                        c="var(--vault-text)"
                      >
                        {fmt(c.amount)}
                      </Text>
                    </Group>
                    <Box
                      h={8}
                      w="100%"
                      style={{
                        background: 'var(--vault-line)',
                        borderRadius: 4,
                      }}
                    >
                      <Box
                        h={8}
                        style={{
                          width: `${(c.amount / maxAmount) * 100}%`,
                          background: categoryColor(c.name),
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid.Col>
          </Grid>
          <Group
            gap={6}
            mt={18}
            pt={14}
            style={{ borderTop: '1px solid var(--vault-line)' }}
          >
            <IconInfoCircle
              size={13}
              color="var(--vault-amber)"
              opacity={0.8}
            />
            <Text
              ff="var(--font-mono)"
              fz="0.72rem"
              c="var(--vault-text)"
              opacity={0.6}
            >
              {EXAMPLE.caption}
            </Text>
          </Group>
        </Box>
      </Container>
    </Box>
  )
}
