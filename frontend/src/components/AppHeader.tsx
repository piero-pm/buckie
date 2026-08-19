import { ReactNode } from 'react'
import {
  ActionIcon,
  Box,
  Container,
  Group,
  Text,
  UnstyledButton,
} from '@mantine/core'
import {
  IconCoins,
  IconList,
  IconHelpCircle,
  IconLogout,
  IconSettings,
  IconTarget,
} from '@tabler/icons-react'
import type { View } from '../pages/views'

interface Props {
  authed: boolean
  active?: View
  onNavigate?: (v: View) => void
  onLogin?: () => void
  onSignOut?: () => void
}

interface NavItem {
  view: View
  label: string
  icon: ReactNode
}

const NAV: NavItem[] = [
  { view: 'expenses', label: 'Expenses', icon: <IconList size={16} /> },
  { view: 'income', label: 'Income', icon: <IconCoins size={16} /> },
  { view: 'expected', label: 'Expected', icon: <IconTarget size={16} /> },
  { view: 'settings', label: 'Settings', icon: <IconSettings size={16} /> },
  { view: 'help', label: 'Help', icon: <IconHelpCircle size={16} /> },
]

/** Persistent top banner (BA-DS-005, BR-NAV-1): one bar, no burger. Signed
 * in: brand + destinations + sign-out. Signed out: brand + Sign in (a text
 * link, never a second filled button — BR-VI-1; auth is passwordless, so
 * the label says sign in). Mid-flow screens: brand only. */
export default function AppHeader({
  authed,
  active,
  onNavigate,
  onLogin,
  onSignOut,
}: Props) {
  return (
    <Box
      component="header"
      pos="sticky"
      top={0}
      bg="var(--paper)"
      style={{ zIndex: 100, borderBottom: '1px solid var(--line)' }}
    >
      <Container size={860} px="md">
        <Group justify="space-between" align="center" h={52} wrap="nowrap">
          <Brand authed={authed} onNavigate={onNavigate} />
          <Group gap={4} wrap="nowrap" align="center">
            {authed &&
              NAV.map((item) => (
                <Destination
                  key={item.view}
                  item={item}
                  active={active === item.view}
                  onSelect={() => onNavigate?.(item.view)}
                />
              ))}
            {authed ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="sign out"
                title="Sign out"
                onClick={onSignOut}
              >
                <IconLogout size={18} />
              </ActionIcon>
            ) : (
              onLogin && (
                <button className="header-signin" onClick={onLogin}>
                  Sign in
                </button>
              )
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  )
}

function Brand({
  authed,
  onNavigate,
}: {
  authed: boolean
  onNavigate?: (v: View) => void
}) {
  if (!authed) {
    return (
      <Text
        fw={700}
        fz="1.15rem"
        ff="var(--font-display)"
        c="var(--ink)"
        style={{ letterSpacing: '-0.01em' }}
      >
        myBuckie
      </Text>
    )
  }
  return (
    <UnstyledButton
      aria-label="myBuckie home"
      c="var(--ink)"
      onClick={() => onNavigate?.('hub')}
    >
      <Text
        span
        fw={700}
        fz="1.15rem"
        ff="var(--font-display)"
        style={{ letterSpacing: '-0.01em' }}
      >
        myBuckie
      </Text>
    </UnstyledButton>
  )
}

function Destination({
  item,
  active,
  onSelect,
}: {
  item: NavItem
  active: boolean
  onSelect: () => void
}) {
  return (
    <UnstyledButton
      aria-label={item.label}
      c={active ? 'var(--rust)' : 'gray.7'}
      px={8}
      py={6}
      style={{ borderRadius: 4 }}
      onClick={onSelect}
    >
      <Group gap={6} wrap="nowrap">
        {item.icon}
        <Text span size="sm" fw={active ? 600 : 500} visibleFrom="xs">
          {item.label}
        </Text>
      </Group>
    </UnstyledButton>
  )
}
