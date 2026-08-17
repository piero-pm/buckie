const MIN = 12
const ALPHANUMERIC = /^[a-zA-Z0-9]+$/

/** Passphrase policy for choosing a new one (BA-DS-001 rules, applied by
 * BR-PASS-1): at least 12 alphanumeric characters, confirmed. Returns a
 * user-facing problem, or null when valid. */
export function validatePassphrasePolicy(
  next: string,
  confirm: string
): string | null {
  if (next.length < MIN) return `Passphrase must be at least ${MIN} characters.`
  if (!ALPHANUMERIC.test(next)) return 'Use letters and numbers only.'
  if (next !== confirm) return 'Passphrases do not match.'
  return null
}
