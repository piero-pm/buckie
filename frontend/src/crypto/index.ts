/**
 * Barrel for the client-side crypto module (ADR-002/003). The server stores only
 * ciphertext + non-secret KDF params + a verifier; the passphrase and derived
 * key never leave the browser.
 */
export {
  deriveKey,
  generateSalt,
  DEFAULT_KDF_PARAMS,
  type KdfParams,
} from './kdf'
export { encrypt, decrypt } from './cipher'
export { cacheKey, hasCachedKey, loadCachedKey, clearKey } from './keystore'
export { setupVault, unlockVault, verifierMatches } from './vault'
export type { VaultEnvelope, DerivedVault } from './vault'
