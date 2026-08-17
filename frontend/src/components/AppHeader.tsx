import { ReactNode } from 'react'
import {
  ActionIcon,
  Box,
  Button,
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
  { view: 'help', label: 'Help', icon: <IconHelpCircle size={16} /> },
]

/** Persistent top banner (BA-DS-005, BR-NAV-1): one bar, no burger. Signed
 * in: brand + destinations + sign-out. Signed out: brand + Log in. Mid-flow
 * screens (login/code/passphrase): brand only — nothing to navigate yet. */
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
      bg="white"
      style={{ zIndex: 100, borderBottom: '1px solid #e9ecef' }}
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
                <Button size="sm" onClick={onLogin}>
                  Log in
                </Button>
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
      <Text fw={700} c="gray.9">
        myBuckie
      </Text>
    )
  }
  return (
    <UnstyledButton
      aria-label="myBuckie home"
      c="gray.9"
      onClick={() => onNavigate?.('hub')}
    >
      <Text span fw={700}>
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
      c={active ? 'orange.7' : 'gray.7'}
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
