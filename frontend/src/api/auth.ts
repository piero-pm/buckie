interface ApiResult {
  ok: boolean
  error?: string
}

/** BR-ERR-2: network-level failures get connection guidance, distinct from
 * server messages. */
const NETWORK_ERROR =
  "Can't reach myBuckie — check your connection and try again."

async function post(path: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const err = data as { error?: string; message?: string }
      return { ok: false, error: err.error ?? err.message }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: NETWORK_ERROR }
  }
}

export function requestCode(email: string): Promise<ApiResult> {
  return post('/api/auth/request-code', { email })
}

export function verifyCode(email: string, code: string): Promise<ApiResult> {
  return post('/api/auth/verify-code', { email, code })
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => undefined)
}
