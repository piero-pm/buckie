import { useState, FormEvent } from 'react'
import {
  Anchor,
  Button,
  Checkbox,
  Stack,
  Text,
  PasswordInput,
} from '@mantine/core'
import { setupVault } from '../api/vault'
import { setupVault as deriveVault } from '../crypto'
import ImportCard from '../components/ImportCard'
import PageShell from '../components/PageShell'

interface Props {
  userId: number
  onUnlocked: () => void
  onRestored?: () => void
}

const MIN = 12
const ALPHANUMERIC = /^[a-zA-Z0-9]+$/

/**
 * First-time encryption-passphrase setup (TICKET-016, EX-PASS-1/2/5). The
 * passphrase is >= 12 alphanumeric chars, confirmed, and the user must
 * explicitly acknowledge that losing it means permanent data loss. The
 * passphrase and derived key never leave the browser; only ciphertext (the
 * verifier) is stored server-side.
 */
export default function PassphraseSetupPage({
  userId,
  onUnlocked,
  onRestored,
}: Props) {
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [restoring, setRestoring] = useState(false)

  function validate(): string | null {
    if (passphrase.length < MIN)
      return `Passphrase must be at least ${MIN} characters.`
    if (!ALPHANUMERIC.test(passphrase)) return 'Use letters and numbers only.'
    if (passphrase !== confirm) return 'Passphrases do not match.'
    if (!acknowledged) return 'Acknowledge the data-loss warning to continue.'
    return null
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError('')
    try {
      const { envelope } = await deriveVault(userId, passphrase)
      await setupVault(envelope)
      onUnlocked()
    } catch {
      setError('Setup failed. If you already set a passphrase, unlock instead.')
    } finally {
      setBusy(false)
    }
  }

  if (restoring && onRestored) {
    return (
      <PageShell
        title="Restore from a backup"
        subtitle="Upload a backup made by myBuckie. Your passphrase becomes the one in use when that backup was created (BR-IMP-3)."
        card
      >
        <ImportCard mode="setup" userId={userId} onRestored={onRestored} />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Set up your private workspace"
      subtitle="Choose an encryption passphrase. It protects your data so only you can read it — not even the host."
      card
    >
      <form onSubmit={handleSubmit} aria-label="set up passphrase">
        <Stack gap="md">
          <PasswordInput
            label={`Passphrase (at least ${MIN} letters/numbers)`}
            id="passphrase"
            placeholder="At least 12 characters"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            autoComplete="new-password"
            required
          />
          <PasswordInput
            label="Confirm passphrase"
            id="confirm"
            placeholder="Re-enter to confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Checkbox
            label="I understand that if I lose this passphrase, my stored data becomes permanently unreadable. There is no recovery."
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.currentTarget.checked)}
          />
          <Button type="submit" fullWidth loading={busy}>
            Create passphrase
          </Button>
          {onRestored && (
            <Anchor
              component="button"
              type="button"
              size="sm"
              onClick={() => setRestoring(true)}
            >
              Restore from a backup instead
            </Anchor>
          )}
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
