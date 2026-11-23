import { useEffect, useRef } from 'react'

export const STALE_AFTER_MS = 10 * 60 * 1000
// visibilitychange and focus usually fire together when coming back
const RETRY_COOLDOWN_MS = 60 * 1000

/**
 * Calls refresh when the user comes back to the tab (or the window gets focus)
 * and the data is older than maxAgeMs.
 */
export function useRefreshWhenStale(
  updatedAt: Date | null,
  refresh: () => void,
  maxAgeMs = STALE_AFTER_MS,
): void {
  const latest = useRef({ updatedAt, refresh })
  const lastTriggerRef = useRef(0)

  useEffect(() => {
    latest.current = { updatedAt, refresh }
  }, [updatedAt, refresh])

  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return
      const { updatedAt, refresh } = latest.current
      if (!updatedAt) return

      const now = Date.now()
      if (now - updatedAt.getTime() < maxAgeMs) return
      if (now - lastTriggerRef.current < RETRY_COOLDOWN_MS) return

      lastTriggerRef.current = now
      refresh()
    }

    document.addEventListener('visibilitychange', check)
    window.addEventListener('focus', check)
    return () => {
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('focus', check)
    }
  }, [maxAgeMs])
}
