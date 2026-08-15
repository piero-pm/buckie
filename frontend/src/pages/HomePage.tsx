import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Box,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Button as MButton,
} from '@mantine/core'
import {
  IconPlus,
  IconList,
  IconRepeat,
  IconChartBar,
  IconLogout,
} from '@tabler/icons-react'
import {
  expenses as expenseApi,
  recurring as recurringApi,
} from '../api/records'
import { signOut as signOutApi } from '../api/auth'
import type { Expense, Recurring } from '../domain/expense'
import { formatEUR } from '../domain/taxonomy'
import CapturePage from './CapturePage'
import ExpensesPage from './ExpensesPage'
import RecurringPage from './RecurringPage'
import DashboardPage from './DashboardPage'

type View = 'hub' | 'capture' | 'expenses' | 'recurring' | 'dashboard'

interface Props {
  userId: number
  onSignOut: () => void
}

/** The signed-in home: a small hub that loads + caches decrypted records and
 * routes to capture / review / recurring / dashboard. Data is fetched once and
 * mutated in place, so sub-pages see updates immediately. */
export default function HomePage({ userId, onSignOut }: Props) {
  const [view, setView] = useState<View>('hub')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [recurring, setRecurring] = useState<Recurring[]>([])
  const [loadError, setLoadError] = useState('')

  async function load() {
    setLoadError('')
    try {
      const [e, r] = await Promise.all([
        expenseApi.list(userId),
        recurringApi.list(userId),
      ])
      setExpenses(e)
      setRecurring(r)
    } catch {
      setLoadError('Could not load your data. Try unlocking again.')
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function handleSignOut() {
    await signOutApi()
    onSignOut()
  }

  if (view === 'capture') {
    return (
      <CapturePage
        existing={expenses}
        onSave={async (e) => {
          await expenseApi.save(userId, e)
          setExpenses((prev) => [e, ...prev])
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'expenses') {
    return (
      <ExpensesPage
        expenses={expenses}
        onUpdate={async (e) => {
          await expenseApi.save(userId, e)
          setExpenses((prev) => prev.map((x) => (x.id === e.id ? e : x)))
        }}
        onDelete={async (id) => {
          await expenseApi.remove(id)
          setExpenses((prev) => prev.filter((x) => x.id !== id))
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'recurring') {
    return (
      <RecurringPage
        items={recurring}
        onSave={async (r) => {
          await recurringApi.save(userId, r)
          setRecurring((prev) => {
            const i = prev.findIndex((x) => x.id === r.id)
            return i >= 0
              ? prev.map((x) => (x.id === r.id ? r : x))
              : [r, ...prev]
          })
        }}
        onDelete={async (id) => {
          await recurringApi.remove(id)
          setRecurring((prev) => prev.filter((x) => x.id !== id))
        }}
        onBack={() => setView('hub')}
      />
    )
  }
  if (view === 'dashboard') {
    return (
      <DashboardPage
        expenses={expenses}
        recurring={recurring}
        onBack={() => setView('hub')}
      />
    )
  }

  const recent = [...expenses]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
  return (
    <Box component="main" aria-label="home">
      <Container size={520} px="md" py="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text fw={600} size="xl" c="gray.9">
                Buckie
              </Text>
              <Text size="xs" c="gray.5">
                Your private spending workspace
              </Text>
            </Stack>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={handleSignOut}
              aria-label="sign out"
              title="Sign out"
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Group>

          {loadError && (
            <Text role="alert" c="red.7" size="sm">
              {loadError}
            </Text>
          )}

          <SimpleGrid cols={2} spacing="sm">
            <NavButton
              icon={<IconPlus size={20} />}
              label="Record a spend"
              onClick={() => setView('capture')}
            />
            <NavButton
              icon={<IconList size={20} />}
              label="Recent expenses"
              onClick={() => setView('expenses')}
            />
            <NavButton
              icon={<IconRepeat size={20} />}
              label="Recurring"
              onClick={() => setView('recurring')}
            />
            <NavButton
              icon={<IconChartBar size={20} />}
              label="Dashboard"
              onClick={() => setView('dashboard')}
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
                  <Group
                    key={e.id}
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
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
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
