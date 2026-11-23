import { useCallback, useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  denied: boolean
}

interface UseGeolocationResult extends GeolocationState {
  supported: boolean
  /** Asks for the position again; onLocated runs once it arrives */
  request: (onLocated?: () => void) => void
}

const checkSupported = () => typeof navigator !== 'undefined' && !!navigator.geolocation

interface UseGeolocationOptions {
  /** Locate on mount; pass false to wait for an explicit request() */
  auto?: boolean
}

export function useGeolocation({ auto = true }: UseGeolocationOptions = {}): UseGeolocationResult {
  // Read once: changing it later must not start or cancel a lookup
  const [autoLocate] = useState(auto)
  const [isSupported] = useState(checkSupported)
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: isSupported && autoLocate,
    denied: false,
  })

  // Only sets state from async callbacks, so it is safe to call inside an effect
  const locate = useCallback((onLocated?: () => void) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setState({
          latitude: coords.latitude,
          longitude: coords.longitude,
          loading: false,
          denied: false,
        })
        onLocated?.()
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED
        setState({ latitude: null, longitude: null, loading: false, denied })
      },
    )
  }, [])

  useEffect(() => {
    if (!isSupported || !autoLocate) return
    locate()
  }, [locate, autoLocate, isSupported])

  const request = useCallback(
    (onLocated?: () => void) => {
      if (!isSupported) return
      setState((prev) => ({ ...prev, loading: true }))
      locate(onLocated)
    },
    [locate, isSupported],
  )

  return { ...state, supported: isSupported, request }
}
