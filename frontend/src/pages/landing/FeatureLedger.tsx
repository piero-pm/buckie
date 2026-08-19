import { Box, Container, Text, Title } from '@mantine/core'
import {
  IconShieldLock,
  IconPencil,
  IconTrendingUp,
  IconHome,
} from '@tabler/icons-react'

type Feature = {
  icon: typeof IconShieldLock
  title: string
  body: string
  tag: string
}

const FEATURES: Feature[] = [
  {
    icon: IconShieldLock,
    title: 'Private by design',
    body: 'Your data encrypts in your browser. The server only ever stores ciphertext — even we can\u2019t read it.',
    tag: 'encryption',
  },
  {
    icon: IconPencil,
    title: 'Frictionless capture',
    body: 'Log a spend in seconds, on your phone or desktop. A few taps, then it\u2019s done.',
    tag: 'capture',
  },
  {
    icon: IconTrendingUp,
    title: 'Real visibility',
    body: 'Month-on-month totals, category breakdown, and a savings projection from your own trend.',
    tag: 'insight',
  },
  {
    icon: IconHome,
    title: 'Self-hosted & free',
    body: 'Open source. Runs on a small ~€5/mo VPS. Your data stays on your terms — no ads, no resale, ever.',
    tag: 'hosting',
  },
]

/** Features as ledger rows (BR-VI-3): hairline dividers, outline icons,
 * mono tags — line items in a ledger, not a generic card grid. */
export default function FeatureLedger() {
  return (
    <Box
      component="section"
      py={{ base: 20, sm: 20 }}
      pb={{ base: 56, sm: 88 }}
    >
      <Container size={1120} px={{ base: 22, sm: 32 }}>
        <Text
          ff="var(--font-mono)"
          fz="0.75rem"
          tt="uppercase"
          lts="0.14em"
          c="var(--ink-soft)"
          mb={6}
        >
          the ledger
        </Text>
        <Title order={2} fz="1.6rem" fw={600} mb={38}>
          What actually happens when you use it
        </Title>
        <Box style={{ borderTop: '1px solid var(--line)' }}>
          {FEATURES.map((f, i) => (
            <div className="ledger-row" key={f.tag}>
              <div className="ledger-icon">
                <f.icon
                  size={18}
                  stroke={1.7}
                  color={i % 2 === 0 ? 'var(--rust)' : 'var(--vault-green)'}
                />
              </div>
              <div>
                <Title order={3} fz="1.15rem" fw={600} mb={8}>
                  {f.title}
                </Title>
                <Text c="var(--ink-soft)" maw={520} style={{ lineHeight: 1.6 }}>
                  {f.body}
                </Text>
              </div>
              <Text
                className="ledger-tag"
                ff="var(--font-mono)"
                fz="0.72rem"
                lts="0.04em"
                c="var(--ink-soft)"
                style={{ whiteSpace: 'nowrap', paddingTop: 4 }}
              >
                {f.tag}
              </Text>
            </div>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
