import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIdleLock } from './useIdleLock'
import 'fake-indexeddb/auto'

describe('useIdleLock (BR-LOCK-IDLE-1, EX-NU-6)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('never locks when disabled (minutes = 0)', () => {
    const onLock = vi.fn()
    renderHook(() => useIdleLock({ userId: 9, minutes: 0, onLock }))
    vi.advanceTimersByTime(10 * 60_000)
    expect(onLock).not.toHaveBeenCalled()
  })

  it('locks after the inactivity window (key clear is awaited first)', async () => {
    const onLock = vi.fn()
    renderHook(() => useIdleLock({ userId: 9, minutes: 5, onLock }))
    vi.advanceTimersByTime(6 * 60_000) // idle past the window
    await vi.advanceTimersByTimeAsync(5_000) // interval fires, check runs
    expect(onLock).toHaveBeenCalledTimes(1)
  })

  it('activity refreshes the window', async () => {
    const onLock = vi.fn()
    renderHook(() => useIdleLock({ userId: 9, minutes: 5, onLock }))
    vi.advanceTimersByTime(4 * 60_000)
    window.dispatchEvent(new Event('click'))
    vi.advanceTimersByTime(4 * 60_000) // 8 min total, 4 since activity
    await vi.advanceTimersByTimeAsync(5_000)
    expect(onLock).not.toHaveBeenCalled()
  })
})
