import { useState, FormEvent } from 'react'
import { verifyCode } from '../api/auth'

interface Props {
  email: string
  onSuccess: () => void
}

export default function CodePage({ email, onSuccess }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = await verifyCode(email, code)
    if (result.ok) {
      onSuccess()
    } else {
      setError(result.error ?? 'Invalid or expired code')
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="enter code">
      <p>We sent a code to {email}</p>
      <label htmlFor="code">6-digit code</label>
      <input
        id="code"
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <button type="submit">Sign in</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
