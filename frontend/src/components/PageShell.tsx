import { ReactNode } from 'react'
import { Card, Container, Stack, Title, Text } from '@mantine/core'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  /** When true, wraps the children in a bordered card. */
  card?: boolean
}

/**
 * Shared page layout: a centered, width-constrained column with a title block.
 * Narrow on desktop (focused app feel), full-bleed with padding on mobile.
 * Used by every page for consistent spacing + responsive behaviour.
 */
export default function PageShell({ title, subtitle, children, card }: Props) {
  return (
    <Container size={420} px="md" py="xl">
      <Stack gap="lg" align="stretch">
        <Stack gap="xs">
          <Title order={1} c="gray.9">
            {title}
          </Title>
          {subtitle && (
            <Text size="sm" c="gray.6">
              {subtitle}
            </Text>
          )}
        </Stack>
        {card ? <Card>{children}</Card> : children}
      </Stack>
    </Container>
  )
}
