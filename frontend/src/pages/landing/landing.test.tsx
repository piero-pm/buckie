import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import LandingPage from './LandingPage'
import { theme } from '../../theme'

function renderLanding() {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </MantineProvider>
  )
}

const reducedMotionMatchMedia = () =>
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: /prefers-reduced-motion/.test(query),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }))

// BR-VI-3: features render as ledger rows with mono tags, not a card grid.
describe('landing feature ledger', () => {
  it('renders the four ledger rows with their tags', () => {
    renderLanding()
    for (const title of [
      'Private by design',
      'Frictionless capture',
      'Real visibility',
      'Self-hosted & free',
    ]) {
      expect(screen.getByText(title)).toBeDefined()
    }
    for (const tag of ['encryption', 'capture', 'insight', 'hosting']) {
      expect(screen.getByText(tag)).toBeDefined()
    }
    expect(screen.getByText('the ledger')).toBeDefined()
  })
})

// BR-VI-1: one filled CTA linking into the auth flow; text says what the
// product is (free), not what the auth isn't (passwordless sign in).
describe('landing CTA hierarchy', () => {
  it('links Get started free to /login', () => {
    renderLanding()
    const cta = screen.getByRole('link', { name: /get started free/i })
    expect(cta.getAttribute('href')).toBe('/login')
  })
})

// BR-VI-4/5: preview is clearly example data; no fabricated social proof.
describe('dashboard preview', () => {
  it('labels the data as an example, with real categories', () => {
    renderLanding()
    expect(screen.getByText('Example data — not a real account')).toBeDefined()
    expect(screen.getByText('Rent')).toBeDefined()
    expect(screen.getByText('Restaurants & drinks')).toBeDefined()
    expect(screen.queryByText(/stars/i)).toBeNull()
  })
})

// BR-VI-2: the vault demo; reduced motion renders the encrypted end state
// without timers, animation reaches ciphertext on the normal path.
describe('vault card', () => {
  it('renders static encrypted rows under prefers-reduced-motion', () => {
    const mm = reducedMotionMatchMedia()
    renderLanding()
    expect(screen.getByText(/only you hold the key/i)).toBeDefined()
    const hex = screen.getAllByText(/^[0-9a-f]{18}…$/)
    expect(hex.length).toBe(3)
    mm.mockRestore()
  })

  it('animates an entry to stored ciphertext', async () => {
    renderLanding()
    expect(
      await screen.findByText('stored as ciphertext', {}, { timeout: 8000 })
    ).toBeDefined()
  })
})
