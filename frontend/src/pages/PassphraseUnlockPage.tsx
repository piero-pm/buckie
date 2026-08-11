import { useState, FormEvent } from 'react'
import { getVault } from '../api/vault'
import { unlockVault, type VaultEnvelope } from '../crypto'

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
      await tryUnlock(userId, passphrase, status.envelope)
      onUnlocked()
    } catch {
      setError('Wrong passphrase, or setup is incomplete.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="unlock workspace">
      <h1>Unlock your workspace</h1>
      <p>
        Enter your encryption passphrase to unlock your data on this device.
      </p>
      <label htmlFor="passphrase">Passphrase</label>
      <input
        id="passphrase"
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={busy}>
        {busy ? 'Unlocking…' : 'Unlock'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}

async function tryUnlock(
  userId: number,
  passphrase: string,
  envelope: VaultEnvelope
): Promise<void> {
  await unlockVault(userId, passphrase, envelope)
}
