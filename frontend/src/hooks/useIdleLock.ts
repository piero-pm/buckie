import { useEffect, useRef } from 'react'
import { clearKey } from '../crypto'

interface Options {
  userId: number
  /** Inactivity window in minutes; 0 = Never (BR-LOCK-IDLE-1). */
  minutes: number
  /** Called on expiry after the key is cleared (routes to unlock). */
  onLock: () => void
}

const ACTIVITY: (keyof WindowEventMap)[] = [
  'click',
  'keydown',
  'scroll',
  'touchstart',
]

/**
 * Idle auto-lock (BR-LOCK-IDLE-1, WORK-007): any click, key, scroll, or
 * touch refreshes the window; after `minutes` without activity the cached
 * key leaves the device and the app routes to unlock. Disabled at 0.
 */
export function useIdleLock({ userId, minutes, onLock }: Options) {
  const onLockRef = useRef(onLock)
  onLockRef.current = onLock

  useEffect(() => {
    if (minutes <= 0) return
    let last = Date.now()
    let timer: ReturnType<typeof setInterval> | null = null
    const bump = () => {
      last = Date.now()
    }
    const stop = () => {
      for (const event of ACTIVITY) window.removeEventListener(event, bump)
      if (timer) clearInterval(timer)
    }
    const check = async () => {
      if (Date.now() - last < minutes * 60_000) return
      stop() // fire exactly once
      await clearKey(userId)
      onLockRef.current()
    }
    for (const event of ACTIVITY) window.addEventListener(event, bump)
    timer = setInterval(check, 5_000)
    return stop
  }, [userId, minutes])
}
