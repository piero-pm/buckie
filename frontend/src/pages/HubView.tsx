import {
  ActionIcon,
  Box,
  Button as MButton,
  Card,
  Container,
  Group,
  Stack,
  Text,
} from '@mantine/core'
import { IconPlus, IconRepeat, IconX } from '@tabler/icons-react'
import type { View } from './views'

interface Props {
  loadError: string
  /** Show the dismissible income-setup card (BR-ONB-2, TICKET-021). */
  showIncomeCard: boolean
  onHideIncomeCard: () => void
  onNavigate: (v: View) => void
  /** The month dashboard embedded in the scroll (BR-HOME-2). */
  children?: React.ReactNode
}

/** The returning home (BR-DASH-1, WORK-005): one scrollable page —
 * add-expense entry at top, then the embedded month view, trend, and the
 * month's expense list (inside children). The old "Recent" block is
 * superseded by the month list at the end of the scroll. */
export default function HubView({
  loadError,
  showIncomeCard,
  onHideIncomeCard,
  onNavigate,
  children,
}: Props) {
  return (
    <Box component="main" aria-label="home">
      <Container size={520} px="md" py="xl">
        <Stack gap="lg">
          {loadError && (
            <Text role="alert" c="red.7" size="sm">
              {loadError}
            </Text>
          )}

          <MButton
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={() => onNavigate('capture')}
            styles={{ root: { height: 56 } }}
          >
            Record a spend
          </MButton>
          <MButton
            variant="light"
            leftSection={<IconRepeat size={20} />}
            onClick={() => onNavigate('recurring')}
            styles={{ root: { height: 56, justifyContent: 'flex-start' } }}
          >
            Recurring
          </MButton>

          {showIncomeCard && (
            <Card withBorder padding="md">
              <Group justify="space-between" wrap="nowrap" align="center">
                <Text size="sm" c="gray.7" style={{ flex: 1 }}>
                  Set up your income to see your full monthly picture.
                </Text>
                <MButton size="xs" onClick={() => onNavigate('income')}>
                  Set up
                </MButton>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label="dismiss income card"
                  onClick={onHideIncomeCard}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Card>
          )}

          {children}
        </Stack>
      </Container>
    </Box>
  )
}
