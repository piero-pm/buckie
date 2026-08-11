import { useState, FormEvent } from 'react'
import { Button, PasswordInput, Stack, Text } from '@mantine/core'
import { getVault } from '../api/vault'
import { unlockVault } from '../crypto'
import PageShell from '../components/PageShell'

interface Props {
  userId: number
  onUnlocked: () => void
}

/**
 * Unlock on a device that has no cached key (new device, or cache cleared). The
 * server supplies the non-secret envelope (salt/params/verifier); the passphrase
 * re-derives the key client-side and tries to decrypt the verifier. A wrong
 * passphrase fails GCM authentication and reveals nothing (EX-PASS-4).
 */
export default function PassphraseUnlockPage({ userId, onUnlocked }: Props) {
  const [passphrase, setPassphrase] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const status = await getVault()
      if (!status.envelope) {
        setError('No passphrase is set. Set one up first.')
        return
      }
      await unlockVault(userId, passphrase, status.envelope)
      onUnlocked()
    } catch {
      setError('Wrong passphrase, or setup is incomplete.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell
      title="Unlock your workspace"
      subtitle="Enter your encryption passphrase to unlock your data on this device."
      card
    >
      <form onSubmit={handleSubmit} aria-label="unlock workspace">
        <Stack gap="md">
          <PasswordInput
            label="Passphrase"
            id="passphrase"
            placeholder="Your encryption passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" fullWidth loading={busy}>
            Unlock
          </Button>
          {error && (
            <Text role="alert" c="red.7" size="sm">
              {error}
            </Text>
          )}
        </Stack>
      </form>
    </PageShell>
  )
}
