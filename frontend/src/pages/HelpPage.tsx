import {
  Anchor,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
} from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import BackupCard from '../components/BackupCard'
import ImportCard from '../components/ImportCard'
import PrivacyExplainer from '../components/PrivacyExplainer'

interface Props {
  onBack: () => void
  userId: number
  onRestored: () => void
}

/** Help + privacy reference (BA-DS-005, TICKET-019) + data & safety
 * (BA-DS-009, TICKET-032/033). The encryption story reuses
 * PrivacyExplainer so onboarding says the same. */
export default function HelpPage({ onBack, userId, onRestored }: Props) {
  return (
    <Box component="main" aria-label="help">
      <Container size={560} px="md" py="xl">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} size="xl" c="gray.9">
              Help
            </Text>
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>

          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="xs">
              How myBuckie works
            </Text>
            <Text size="sm" c="gray.6">
              Record spends as they happen with “Record a spend”. Add fixed
              monthly costs once under “Recurring” and they count in every month
              automatically. The “Dashboard” shows month-on-month totals, a
              category breakdown, and a savings projection.
            </Text>
          </Card>

          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="sm">
              Privacy and encryption
            </Text>
            <PrivacyExplainer />
          </Card>

          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="sm">
              Data and safety
            </Text>
            <Stack gap="sm">
              <BackupCard />
              <Divider />
              <ImportCard mode="help" userId={userId} onRestored={onRestored} />
            </Stack>
          </Card>

          <Card withBorder padding="lg">
            <Text size="sm" fw={600} c="gray.7" mb="xs">
              Self-hosting and source
            </Text>
            <Text size="sm" c="gray.6">
              myBuckie is open source. Read the code or run your own instance:{' '}
              <Anchor
                href="https://github.com/piero-pm/buckie"
                target="_blank"
                rel="noreferrer"
              >
                github.com/piero-pm/buckie
              </Anchor>{' '}
              — the INSTALL.md in the repository has step-by-step self-hosting
              instructions.
            </Text>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
