import { useCallback, useEffect, useRef } from 'react'

/**
 * For requests started on demand where only the latest one matters.
 * `start()` aborts the previous request and returns the signal for the new one;
 * `abort()` drops the current one; unmounting aborts it too.
 * After each await check `signal.aborted`: a replaced request must not touch the state.
 */
export function useLatestRequest() {
  const controllerRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  const start = useCallback(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    return controller.signal
  }, [])

  useEffect(() => abort, [abort])

  return { start, abort }
}
