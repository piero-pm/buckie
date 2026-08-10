import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import App from './App'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const meOk = { ok: true, json: async () => ({ user_id: 1 }) }
const me401 = { ok: false, json: async () => ({}) }
const codeSent = {
  ok: true,
  json: async () => ({ message: 'a code was sent' }),
}
const signedIn = { ok: true, json: async () => ({ message: 'signed in' }) }
const badCode = {
  ok: false,
  json: async () => ({ error: 'invalid or expired code' }),
}

describe('Login flow', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('renders login form when not authenticated', async () => {
    mockFetch.mockResolvedValueOnce(me401)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDefined()
    })
  })

  it('shows private home when already authenticated', async () => {
    mockFetch.mockResolvedValueOnce(meOk)
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeDefined()
    })
  })

  it('advances to code entry after email submission', async () => {
    mockFetch.mockResolvedValueOnce(me401).mockResolvedValueOnce(codeSent)
    render(<App />)
    await waitFor(() => screen.getByLabelText(/email/i))
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/6-digit/i)).toBeDefined()
    })
  })

  it('reaches private home after correct code', async () => {
    mockFetch
      .mockResolvedValueOnce(me401)
      .mockResolvedValueOnce(codeSent)
      .mockResolvedValueOnce(signedIn)
    render(<App />)
    await waitFor(() => screen.getByLabelText(/email/i))
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => screen.getByPlaceholderText(/6-digit/i))
    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: '123456' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /enter code/i }))
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeDefined()
    })
  })

  it('shows error and stays on code page for wrong code (gate)', async () => {
    mockFetch
      .mockResolvedValueOnce(me401)
      .mockResolvedValueOnce(codeSent)
      .mockResolvedValueOnce(badCode)
    render(<App />)
    await waitFor(() => screen.getByLabelText(/email/i))
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /sign in/i }))
    await waitFor(() => screen.getByPlaceholderText(/6-digit/i))
    fireEvent.change(screen.getByLabelText(/6-digit code/i), {
      target: { value: '000000' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /enter code/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined()
    })
    expect(screen.queryByRole('main')).toBeNull()
  })
})
