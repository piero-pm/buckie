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
import type { Expense } from '../domain/expense'
import { formatEUR } from '../domain/taxonomy'
import type { View } from './views'

interface Props {
  expenses: Expense[]
  loadError: string
  /** Show the dismissible income-setup card (BR-ONB-2, TICKET-021). */
  showIncomeCard: boolean
  onHideIncomeCard: () => void
  onNavigate: (v: View) => void
  /** The month dashboard embedded in the scroll (BR-HOME-2, TICKET-027). */
  children?: React.ReactNode
}

/** The returning home: one scrollable page — add-expense entry at top,
 * then recent spends, then the embedded month dashboard (BR-HOME-2). */
export default function HubView({
  expenses,
  loadError,
  showIncomeCard,
  onHideIncomeCard,
  onNavigate,
  children,
}: Props) {
  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
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

          <Stack gap="xs" mt="xs">
            <Text size="sm" fw={600} c="gray.7">
              Recent
            </Text>
            {recent.length === 0 ? (
              <Text size="sm" c="gray.5">
                No expenses yet. Record your first spend.
              </Text>
            ) : (
              <Stack gap={0}>
                {recent.map((e) => (
                  <RecentRow key={e.id} expense={e} />
                ))}
              </Stack>
            )}
          </Stack>

          {children}
        </Stack>
      </Container>
    </Box>
  )
}

function RecentRow({ expense: e }: { expense: Expense }) {
  return (
    <Group
      justify="space-between"
      py="xs"
      styles={{ root: { borderBottom: '1px solid #e9ecef' } }}
    >
      <Stack gap={2}>
        <Text size="sm" fw={500} c="gray.9">
          {e.category}
          {e.note ? (
            <Text component="span" size="xs" c="gray.5">
              {' '}
              · {e.note}
            </Text>
          ) : null}
        </Text>
        <Text size="xs" c="gray.5">
          {e.date}
        </Text>
      </Stack>
      <Text size="sm" fw={600} c="gray.9">
        {formatEUR(e.amount)}
      </Text>
    </Group>
  )
}
