import { useState, useEffect, FormEvent } from 'react'
import { Anchor, Button, Stack, Text, TextInput } from '@mantine/core'
import { requestCode, verifyCode } from '../api/auth'
import PageShell from '../components/PageShell'

interface Props {
  email: string
  onSuccess: () => void
  /** BR-ERR-3: path back to change the email address. */
  onChangeEmail: () => void
}

/** Resend cooldown in seconds (default adopted at the BA gate,
 * work-state-003 §2). */
const RESEND_COOLDOWN_S = 60

export default function CodePage({ email, onSuccess, onChangeEmail }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown === 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = await verifyCode(email, code)
    setBusy(false)
    if (result.ok) {
      onSuccess()
    } else {
      setError(result.error ?? 'Invalid or expired code')
    }
  }

  // EX-ERR-3: a fresh code can be requested in place, under the same limits.
  async function handleResend() {
    setBusy(true)
    setError('')
    setNotice('')
    const result = await requestCode(email)
    setBusy(false)
    if (result.ok) {
      setCooldown(RESEND_COOLDOWN_S)
      setNotice(`A new code is on its way to ${email}.`)
    } else {
      setError(result.error ?? 'Could not resend. Try again.')
    }
  }

  return (
    <PageShell
      title="Check your email"
      subtitle={`We sent a 6-digit code to ${email}.`}
      card
    >
      <form onSubmit={handleSubmit} aria-label="enter code">
        <Stack gap="md">
          <TextInput
            label="6-digit code"
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            ta="center"
            size="lg"
            required
          />
          <Button type="submit" fullWidth loading={busy}>
            Sign in
          </Button>
          <Button
            variant="subtle"
            color="gray"
            fullWidth
            onClick={handleResend}
            disabled={cooldown > 0 || busy}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Button>
          <Anchor
            component="button"
            type="button"
            size="sm"
            ta="center"
            onClick={onChangeEmail}
          >
            Use a different email
          </Anchor>
          {notice && (
            <Text role="status" c="green.7" size="sm">
              {notice}
            </Text>
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
