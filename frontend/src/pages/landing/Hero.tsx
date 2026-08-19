import {
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import VaultCard from './VaultCard'

/** Landing hero (BR-VI-1/2): mono eyebrow, Fraunces headline with a rust
 * italic, one filled rust CTA to /login, trust line — with the vault card
 * demoing client-side encryption beside the copy. */
export default function Hero() {
  return (
    <Container size={1120} px={{ base: 22, sm: 32 }} py={{ base: 48, sm: 76 }}>
      <Grid gutter={56} align="center">
        <Grid.Col span={{ base: 12, sm: 7 }} order={{ base: 2, sm: 1 }}>
          <Stack gap={0} align="flex-start">
            <Group gap={8} mb={22}>
              <span className="eyebrow-dot" />
              <Text
                ff="var(--font-mono)"
                fz="0.72rem"
                lts="0.14em"
                tt="uppercase"
                c="var(--vault-green)"
              >
                encrypted client-side
              </Text>
            </Group>
            <Title
              order={1}
              style={{
                fontSize: 'clamp(2.6rem, 5.2vw, 4.1rem)',
                lineHeight: 1.03,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              Your money,
              <br />
              yours{' '}
              <em
                style={{
                  fontStyle: 'italic',
                  fontWeight: 500,
                  color: 'var(--rust)',
                }}
              >
                alone.
              </em>
            </Title>
            <Text
              mt={24}
              size="lg"
              c="var(--ink-soft)"
              maw={460}
              style={{ lineHeight: 1.6 }}
            >
              A self-hosted, privacy-first spending tracker. Everything encrypts
              in your browser before it ever reaches the server — so no one but
              you can read it.
            </Text>
            <Button
              component={Link}
              to="/login"
              size="lg"
              mt={34}
              rightSection={<IconArrowRight size={18} className="cta-arrow" />}
            >
              Get started free
            </Button>
            <Text
              mt={22}
              ff="var(--font-mono)"
              fz="0.78rem"
              c="var(--ink-soft)"
            >
              open source · self-hosted · €0
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 5 }} order={{ base: 1, sm: 2 }}>
          <VaultCard />
        </Grid.Col>
      </Grid>
    </Container>
  )
}
