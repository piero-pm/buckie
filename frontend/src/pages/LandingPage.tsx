import {
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconShieldLock,
  IconPencil,
  IconChartBar,
  IconHome,
  IconArrowRight,
} from '@tabler/icons-react'
import { ReactNode } from 'react'

interface Props {
  onAccess: () => void
}

/** Public landing page (no auth). Pitches Penny Saver as a self-hostable,
 * privacy-first, open-source spending tracker, with one CTA into the private
 * space. Scope expansion approved 2026-08-12 (interface-system.md excludes
 * marketing unless separately approved). */
export default function LandingPage({ onAccess }: Props) {
  return (
    <Box>
      <Hero onAccess={onAccess} />
      <Container size={860} px="md" py={48}>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 4 }} spacing="md">
          <FeatureCard
            icon={<IconShieldLock size={22} />}
            title="Private by design"
            body="Your data is encrypted in your browser. The server only ever stores ciphertext — even the operator can't read it."
          />
          <FeatureCard
            icon={<IconPencil size={22} />}
            title="Frictionless capture"
            body="Record a spend in seconds, on your phone or desktop. It takes a few taps, then it's done."
          />
          <FeatureCard
            icon={<IconChartBar size={22} />}
            title="Real visibility"
            body="Month-on-month totals, category breakdown, and a savings projection from your own trend."
          />
          <FeatureCard
            icon={<IconHome size={22} />}
            title="Self-hosted & free"
            body="Open source. Runs on a small ~£5/mo VPS. Your data stays on your terms — no ads, no resale, ever."
          />
        </SimpleGrid>
      </Container>
      <Footer />
    </Box>
  )
}

function Hero({ onAccess }: { onAccess: () => void }) {
  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #4f66fc 0%, #2842b5 100%)',
        color: 'white',
      }}
    >
      <Container size={860} px="md" py={64}>
        <Stack gap="md" align="flex-start">
          <Title
            order={1}
            style={{ color: 'white', fontSize: '2.5rem', lineHeight: 1.1 }}
          >
            Your money,
            <br />
            yours alone.
          </Title>
          <Text size="lg" c="#e7ebff" maw={520}>
            A self-hosted, privacy-first spending tracker. See where your money
            goes each month — without handing your data to anyone.
          </Text>
          <Group gap="sm" mt="sm">
            <Button
              size="lg"
              color="white"
              variant="filled"
              rightSection={<IconArrowRight size={18} />}
              onClick={onAccess}
            >
              Access your space
            </Button>
          </Group>
          <Text size="xs" c="#b8c4ff" mt="md">
            Open source · self-hosted · €0
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <Card withBorder padding="lg" h="100%">
      <Stack gap="xs">
        <ThemeIcon variant="light" color="indigo" size={40} radius="sm">
          {icon}
        </ThemeIcon>
        <Text fw={600} size="sm" c="gray.9">
          {title}
        </Text>
        <Text size="xs" c="gray.6">
          {body}
        </Text>
      </Stack>
    </Card>
  )
}

function Footer() {
  return (
    <Box style={{ borderTop: '1px solid #e9ecef' }}>
      <Container size={860} px="md" py="lg">
        <Group justify="space-between">
          <Text size="xs" c="gray.5">
            Penny Saver — built open-source.
          </Text>
          <Text
            size="xs"
            c="indigo"
            component="a"
            href="https://github.com/piero-pm/penny-saver"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub →
          </Text>
        </Group>
      </Container>
    </Box>
  )
}
