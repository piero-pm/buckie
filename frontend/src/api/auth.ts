interface ApiResult {
  ok: boolean
  error?: string
}

export async function requestCode(email: string): Promise<ApiResult> {
  try {
    const res = await fetch('/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: (data as { error?: string }).error }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error' }
  }
}

export async function verifyCode(
  email: string,
  code: string
): Promise<ApiResult> {
  try {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: (data as { error?: string }).error }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Network error' }
  }
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/sign-out', { method: 'POST' }).catch(() => undefined)
}
