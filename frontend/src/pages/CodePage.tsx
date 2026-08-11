import { useState, FormEvent } from 'react'
import { Button, Stack, Text, TextInput } from '@mantine/core'
import { verifyCode } from '../api/auth'
import PageShell from '../components/PageShell'

interface Props {
  email: string
  onSuccess: () => void
}

export default function CodePage({ email, onSuccess }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
