import { signOut } from '../api/auth'

interface Props {
  onSignOut: () => void
}

export default function HomePage({ onSignOut }: Props) {
  async function handleSignOut() {
    await signOut()
    onSignOut()
  }

  return (
    <main>
      <h1>Penny Saver</h1>
      <p>You&apos;re signed in. Expense capture coming soon.</p>
      <button onClick={handleSignOut}>Sign out</button>
    </main>
  )
}
