import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import PrivacyExplainer from '../components/PrivacyExplainer'
import IncomeForm from './IncomeForm'
import type { IncomeSource } from '../domain/income'

interface Props {
  sources: IncomeSource[]
  onSave: (source: IncomeSource) => Promise<void>
  onFinish: (skipped: boolean) => void
}

/** Two-stage first-run onboarding (TICKET-021, BR-ONB-1): stage 1 explains
 * how myBuckie works and how privacy is protected; stage 2 collects income
 * sources (salary, savings, investments) with Skip / Done. */
export default function OnboardingPage({ sources, onSave, onFinish }: Props) {
  const [step, setStep] = useState<1 | 2>(1)

  if (step === 1) {
    return (
      <Box component="main" aria-label="onboarding">
        <Container size={560} px="md" py="xl">
          <Stack gap="md">
            <Title order={1} c="gray.9">
              Welcome to myBuckie
            </Title>
            <Card withBorder padding="lg">
              <Text size="sm" fw={600} c="gray.7" mb="xs">
                How myBuckie works
              </Text>
              <Text size="sm" c="gray.6">
                Record spends as they happen, register fixed monthly costs once
                under “Recurring”, and read your month on the “Dashboard”.
                Income sources — salary, savings, investments — complete the
                picture.
              </Text>
            </Card>
            <Card withBorder padding="lg">
              <Text size="sm" fw={600} c="gray.7" mb="sm">
                Privacy and encryption
              </Text>
              <PrivacyExplainer />
            </Card>
            <Button
              fullWidth
              rightSection={<IconArrowRight size={16} />}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </Stack>
        </Container>
      </Box>
    )
  }
  return (
    <Box component="main" aria-label="onboarding">
      <Container size={560} px="md" py="xl">
        <Stack gap="md">
          <Title order={1} c="gray.9">
            Set up your income
          </Title>
          <Text size="sm" c="gray.6">
            Add your monthly sources — salary, savings, stock investments. You
            can edit them anytime from the Income section.
          </Text>
          {sources.length > 0 && (
            <Text size="sm" c="green.7" fw={500}>
              Added {sources.length} source
              {sources.length === 1 ? '' : 's'} so far.
            </Text>
          )}
          <Card withBorder padding="lg">
            <IncomeForm onSave={onSave} />
          </Card>
          <Group grow>
            <Button
              variant="subtle"
              color="gray"
              onClick={() => onFinish(true)}
            >
              Skip for now
            </Button>
            <Button onClick={() => onFinish(false)}>Done</Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  )
}
