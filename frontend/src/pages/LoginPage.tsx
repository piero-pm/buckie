import { useState, FormEvent } from 'react'
import { Button, Stack, Text, TextInput } from '@mantine/core'
import { IconAt } from '@tabler/icons-react'
import { requestCode } from '../api/auth'
import PageShell from '../components/PageShell'

interface Props {
  onCodeSent: (email: string) => void
}

export default function LoginPage({ onCodeSent }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = await requestCode(email)
    setBusy(false)
    if (result.ok) {
      onCodeSent(email)
    } else {
      setError(result.error ?? 'Something went wrong')
    }
  }

  return (
    <PageShell
      title="Penny Saver"
      subtitle="Sign in to your private workspace."
      card
    >
      <form onSubmit={handleSubmit} aria-label="sign in">
        <Stack gap="md">
          <TextInput
            label="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftSection={<IconAt size={16} />}
            required
          />
          <Button type="submit" fullWidth loading={busy}>
            Send code
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
