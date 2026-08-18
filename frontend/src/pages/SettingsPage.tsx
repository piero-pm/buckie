import { useState } from 'react'
import { Button, Group, Select, Stack, Text } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  CURRENCIES,
  IDLE_OPTIONS,
  validateSettings,
  type CurrencyCode,
  type IdleMinutes,
  type Settings,
} from '../domain/settings'
import { SETTINGS_ID } from '../domain/ids'
import PageShell from '../components/PageShell'

interface Props {
  settings: Settings
  onSave: (settings: Settings) => Promise<void>
  onBack: () => void
}

const idleLabel = (m: IdleMinutes) => (m === 0 ? 'Never' : `${m} minutes`)

/** Display + privacy settings (BR-CUR-1, BR-LOCK-IDLE-1, WORK-007).
 * Currency is display-only formatting; idle lock clears the cached key
 * after inactivity (default Never — gate 2026-08-18). */
export default function SettingsPage({ settings, onSave, onBack }: Props) {
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency)
  const [idle, setIdle] = useState<IdleMinutes>(settings.idleLockMinutes)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setError('')
    const result = validateSettings({ currency, idleLockMinutes: idle })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    try {
      await onSave({ id: SETTINGS_ID, currency, idleLockMinutes: idle })
      setSaved(true)
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell
      title="Settings"
      subtitle="Display and privacy preferences."
      card={false}
    >
      <Stack gap="md">
        <Select
          label="Display currency"
          id="currency"
          description="Formatting only — your amounts are never converted."
          data={CURRENCIES.map((c) => ({ value: c, label: c }))}
          value={currency}
          onChange={(v) => setCurrency((v as CurrencyCode) ?? currency)}
        />
        <Select
          label="Lock after inactivity"
          id="idle-lock"
          description="Clears the encryption key from this device and asks
for your passphrase again."
          data={IDLE_OPTIONS.map((m) => ({
            value: String(m),
            label: idleLabel(m),
          }))}
          value={String(idle)}
          onChange={(v) => setIdle((Number(v) as IdleMinutes) ?? idle)}
        />
        <Group>
          <Button onClick={save} loading={busy}>
            Save
          </Button>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
        </Group>
        {saved && !busy && (
          <Text size="sm" c="teal.7">
            Saved.
          </Text>
        )}
        {error && (
          <Text role="alert" c="red.7" size="sm">
            {error}
          </Text>
        )}
      </Stack>
    </PageShell>
  )
}
