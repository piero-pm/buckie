import { useState } from 'react'
import { Button, Group, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconDownload } from '@tabler/icons-react'
import { raw } from '../api/records'
import { getEnvelopeJson } from '../api/vault'
import { buildBundle, downloadBundle } from '../domain/backup'
import { failToast } from './failToast'

/** Download an encrypted backup (BA-DS-009 BR-EXP-1/2, TICKET-032): the vault
 * envelope plus every record ciphertext, client-side only. The file is safe to
 * keep anywhere and restores via "Upload a backup" below. */
export default function BackupCard() {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    setBusy(true)
    try {
      const [vault, records] = await Promise.all([
        getEnvelopeJson(),
        raw.listAll(),
      ])
      downloadBundle(buildBundle(vault, records))
      notifications.show({
        message: 'Backup downloaded. Keep it somewhere safe.',
        color: 'green',
      })
    } catch {
      failToast('download the backup')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
      <Text size="sm" c="gray.6">
        One file with everything myBuckie stores for you — encrypted. Without
        your passphrase it is unreadable anywhere.
      </Text>
      <Button
        variant="light"
        leftSection={<IconDownload size={16} />}
        loading={busy}
        onClick={handleDownload}
      >
        Download backup
      </Button>
    </Group>
  )
}
