import { useState, FormEvent } from 'react'
import { requestCode } from '../api/auth'

interface Props {
  onCodeSent: (email: string) => void
}

export default function LoginPage({ onCodeSent }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = await requestCode(email)
    if (result.ok) {
      onCodeSent(email)
    } else {
      setError(result.error ?? 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="sign in">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send code</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
