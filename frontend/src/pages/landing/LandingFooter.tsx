import { Anchor, Box, Container, Group, Text } from '@mantine/core'

/** Landing footer: open-source line + GitHub link (rust); no star badge
 * (BR-VI-5 — no fabricated social proof). */
export default function LandingFooter() {
  return (
    <Box style={{ borderTop: '1px solid var(--line)' }}>
      <Container
        size={1120}
        px={{ base: 22, sm: 32 }}
        py={{ base: 24, sm: 30 }}
      >
        <Group justify="space-between" wrap="wrap" gap={12}>
          <Text size="sm" c="var(--ink-soft)">
            myBuckie — built open-source.
          </Text>
          <Anchor
            href="https://github.com/piero-pm/buckie"
            target="_blank"
            rel="noreferrer"
            c="var(--rust)"
            fw={500}
            size="sm"
          >
            View on GitHub →
          </Anchor>
        </Group>
      </Container>
    </Box>
  )
}
