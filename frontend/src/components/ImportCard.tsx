import { useState } from 'react'
import { FileInput, Stack, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { restoreBundle } from '../api/backup'
import { parseBundle } from '../domain/backup'
import { failToast } from './failToast'

interface Props {
  mode: 'help' | 'setup'
  userId: number
  onRestored: () => void
}

/** Restore a backup bundle (BA-DS-009 BR-IMP-1..4, TICKET-033). Setup mode
 * adopts the bundle's envelope on a fresh account; help mode requires the
 * bundle to decrypt under the current key. Records merge: newer local records
 * stay, collisions take the bundle. The flow lives in api/backup. */
export default function ImportCard({ mode, userId, onRestored }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleRestore(f: File | null) {
    if (!f) return
    setBusy(true)
    setError('')
    try {
      const bundle = parseBundle(await f.text())
      await restoreBundle(userId, bundle, mode)
      notifications.show({ message: 'Backup restored.', color: 'green' })
      setFile(null)
      onRestored()
    } catch (e) {
      setError(messageFor(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack gap="xs">
      <FileInput
        label="Upload a backup"
        placeholder="Choose a buckie-backup file"
        accept="application/json,.json"
        value={file}
        onChange={(v) => {
          setFile(v)
          void handleRestore(v)
        }}
        disabled={busy}
        clearable
      />
      <Text size="xs" c="gray.6">
        {mode === 'setup'
          ? 'Restoring sets your passphrase to the one used when the backup was made.'
          : 'Records added after this backup stay; anything it contains is restored.'}
      </Text>
      {error && (
        <Text role="alert" c="red.7" size="sm">
          {error}
        </Text>
      )}
      {busy && (
        <Text size="sm" c="gray.6">
          Restoring…
        </Text>
      )}
    </Stack>
  )
}

function messageFor(e: unknown): string {
  const msg = e instanceof Error ? e.message : ''
  if (msg === 'wrong-key') {
    return 'This backup was made with a different passphrase — it cannot be restored into this workspace.'
  }
  if (msg.startsWith('Unrecognized') || msg.startsWith('Not a valid')) {
    return msg
  }
  failToast('restore the backup')
  return ''
}
