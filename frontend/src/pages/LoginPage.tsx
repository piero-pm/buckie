import { useState, FormEvent } from 'react'
import { Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { IconAt, IconArrowLeft } from '@tabler/icons-react'
import { requestCode } from '../api/auth'
import PageShell from '../components/PageShell'

interface Props {
  onCodeSent: (email: string) => void
  onBack: () => void
}

export default function LoginPage({ onCodeSent, onBack }: Props) {
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
      title="Buckie"
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
          <Group justify="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>
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
