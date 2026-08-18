import type { NavigateFunction } from 'react-router-dom'
import { getVault } from '../api/vault'
import { loadCachedKey } from '../crypto'

/** Deep-link target carried through login/setup/unlock (BR-ROUTE-1). */
export type From = { from?: string }

// routeAfterAuth picks the post-auth destination from vault status + cached
// key: no vault -> setup; vault + cached key -> target (same-device,
// EX-PASS-3); vault + no key -> unlock carrying the target (EX-NU-3).
export async function routeAfterAuth(
  userId: number,
  target: string,
  navigate: NavigateFunction,
  from?: string
) {
  try {
    const status = await getVault()
    if (!status.hasPassphrase) {
      navigate('/passphrase-setup', { state: { from } })
      return
    }
    const cached = await loadCachedKey(userId)
    if (cached) navigate(target, { replace: true, state: { from } })
    else navigate('/passphrase-unlock', { state: { from: from ?? target } })
  } catch {
    navigate(target, { replace: true }) // vault check failed: fall back to home
  }
}
