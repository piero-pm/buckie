import { List, Text, ThemeIcon } from '@mantine/core'
import {
  IconKey,
  IconLock,
  IconEyeOff,
  IconAlertTriangle,
} from '@tabler/icons-react'

const ITEMS = [
  {
    icon: <IconKey size={14} />,
    body: 'Your passphrase never leaves your browser — not during setup, not during unlock, never.',
  },
  {
    icon: <IconLock size={14} />,
    body: 'It derives your encryption key (Argon2id); every record is encrypted (AES-256-GCM) before it leaves your device.',
  },
  {
    icon: <IconEyeOff size={14} />,
    body: 'The server stores only unreadable ciphertext. The host can never see your amounts, categories, or income.',
  },
  {
    icon: <IconAlertTriangle size={14} />,
    body: 'There is no recovery: if you lose the passphrase, your stored data is permanently unreadable.',
  },
]

/** Plain-language privacy + encryption walkthrough (BR-HLP-1). Shared by the
 * Help page (TICKET-019) and onboarding stage 1 (TICKET-021) so the story is
 * identical everywhere it is told. */
export default function PrivacyExplainer() {
  return (
    <List spacing="sm">
      {ITEMS.map((item) => (
        <List.Item
          key={item.body}
          icon={
            <ThemeIcon variant="light" color="orange" size={24} radius="sm">
              {item.icon}
            </ThemeIcon>
          }
        >
          <Text size="sm" c="gray.6">
            {item.body}
          </Text>
        </List.Item>
      ))}
    </List>
  )
}
