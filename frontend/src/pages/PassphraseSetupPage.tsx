import { useState, FormEvent } from 'react'
import { setupVault } from '../api/vault'
import { setupVault as deriveVault } from '../crypto'

interface Props {
  userId: number
  onUnlocked: () => void
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
export default function PassphraseSetupPage({ userId, onUnlocked }: Props) {
  const [passphrase, setPassphrase] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} aria-label="set up passphrase">
      <h1>Set up your private workspace</h1>
      <p>
        Choose an encryption passphrase. It protects your financial data so that
        only you can read it — not even the host.
      </p>
      <label htmlFor="passphrase">
        Passphrase (at least {MIN} letters/numbers)
      </label>
      <input
        id="passphrase"
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        autoComplete="new-password"
        required
      />
      <label htmlFor="confirm">Confirm passphrase</label>
      <input
        id="confirm"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
      />
      <label>
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(e) => setAcknowledged(e.target.checked)}
        />{' '}
        I understand that if I lose this passphrase, my stored data becomes
        permanently unreadable. There is no recovery.
      </label>
      <button type="submit" disabled={busy}>
        {busy ? 'Setting up…' : 'Create passphrase'}
      </button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
