import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// jsdom (v24) ships getRandomValues but not crypto.subtle. Node 18+ provides a
// complete WebCrypto implementation; expose it so the crypto module (AES-GCM,
// non-extractable keys) works under vitest's jsdom environment.
if (globalThis.crypto && !globalThis.crypto.subtle) {
  const nodeCrypto = globalThis.crypto
  Object.defineProperty(globalThis, 'crypto', {
    value: nodeCrypto,
    configurable: true,
  })
}
