import { useState, FormEvent } from 'react'
import { Button, Stack, Text, PasswordInput } from '@mantine/core'
import { changePassphrase } from '../api/passphrase'
import { validatePassphrasePolicy } from '../domain/passphrase'

interface Props {
  userId: number
}

/** Change the encryption passphrase (BA-DS-009 BR-PASS-1..3, TICKET-035).
 * The flow verifies the current passphrase, advises a backup first, and
 * re-encrypts everything client-side; the envelope is swapped last. On error
 * the user stays here and can retry — nothing is presented as success. */
export default function PassphraseChangeCard({ userId }: Props) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const problem = validatePassphrasePolicy(next, confirm)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError('')
    try {
      await changePassphrase(userId, current, next)
      setDone(true)
    } catch (err) {
      setError(messageFor(err))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Stack gap="xs">
        <Text size="sm" fw={600} c="green.7">
          Passphrase changed. Your data is unchanged and readable.
        </Text>
        <Text size="xs" c="gray.6">
          Other devices: sign out there and unlock again with the new
          passphrase.
        </Text>
      </Stack>
    )
  }

  return (
    <form onSubmit={handleSubmit} aria-label="change passphrase">
      <Stack gap="sm">
        <Text size="sm" c="gray.6">
          Download a backup first (above). Changing re-encrypts every record in
          your browser — keep this page open until it finishes.
        </Text>
        <PasswordInput
          label="Current passphrase"
          placeholder="Your current passphrase"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
        <PasswordInput
          label="New passphrase (at least 12 letters/numbers)"
          placeholder="At least 12 characters"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          required
        />
        <PasswordInput
          label="Confirm new passphrase"
          placeholder="Re-enter to confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="light" loading={busy}>
          Change passphrase
        </Button>
        {error && (
          <Text role="alert" c="red.7" size="sm">
            {error}
          </Text>
        )}
      </Stack>
    </form>
  )
}

function messageFor(e: unknown): string {
  const msg = e instanceof Error ? e.message : ''
  if (msg === 'wrong passphrase')
    return 'The current passphrase is not correct.'
  if (msg === 'no passphrase set')
    return 'No passphrase is set on this account yet.'
  if (msg === 'record could not be decrypted')
    return 'A record could not be decrypted — stop and contact support before retrying.'
  return 'Could not change the passphrase — your data is safe. Stay on this page and try again.'
}
