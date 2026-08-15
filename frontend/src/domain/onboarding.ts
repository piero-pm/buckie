/** Durable onboarding skip marker (TICKET-021, BR-ONB-2). UI-state only —
 * holds no personal data, so localStorage is fine; financial records stay in
 * the encrypted vault. Keyed per user so shared devices behave correctly. */
const KEY = (userId: number) => `buckie.onboarding.skipped.${userId}`

export function hasSkippedOnboarding(userId: number): boolean {
  try {
    return localStorage.getItem(KEY(userId)) === '1'
  } catch {
    return false
  }
}

export function markOnboardingSkipped(userId: number): void {
  try {
    localStorage.setItem(KEY(userId), '1')
  } catch {
    // storage unavailable: onboarding may re-show later; harmless
  }
}
