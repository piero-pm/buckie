import {
  Box,
  Button as MButton,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'
import { IconPlus, IconRepeat, IconChartBar } from '@tabler/icons-react'
import type { Expense } from '../domain/expense'
import { formatEUR } from '../domain/taxonomy'
import type { View } from './views'

interface Props {
  expenses: Expense[]
  loadError: string
  onNavigate: (v: View) => void
}

/** The signed-in hub (rendered by HomePage): quick actions + the five most
 * recent spends. Header destinations (Expenses/Income/Help) live in the
 * persistent top banner (BA-DS-005). */
export default function HubView({ expenses, loadError, onNavigate }: Props) {
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

          <SimpleGrid cols={2} spacing="sm">
            <NavButton
              icon={<IconPlus size={20} />}
              label="Record a spend"
              onClick={() => onNavigate('capture')}
            />
            <NavButton
              icon={<IconRepeat size={20} />}
              label="Recurring"
              onClick={() => onNavigate('recurring')}
            />
            <NavButton
              icon={<IconChartBar size={20} />}
              label="Dashboard"
              onClick={() => onNavigate('dashboard')}
            />
          </SimpleGrid>

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

function NavButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <MButton
      variant="light"
      fullWidth
      leftSection={icon}
      onClick={onClick}
      styles={{ root: { height: 56, justifyContent: 'flex-start' } }}
    >
      {label}
    </MButton>
  )
}
