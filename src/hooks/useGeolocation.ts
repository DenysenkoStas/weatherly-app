import { useCallback, useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  denied: boolean
}

interface UseGeolocationResult extends GeolocationState {
  supported: boolean
  request: () => void
}

const isSupported = typeof navigator !== 'undefined' && !!navigator.geolocation

interface UseGeolocationOptions {
  /** Locate on mount; pass false to wait for an explicit request() */
  auto?: boolean
}

export function useGeolocation({ auto = true }: UseGeolocationOptions = {}): UseGeolocationResult {
  // Read once: changing it later must not start or cancel a lookup
  const [autoLocate] = useState(auto)
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: isSupported && autoLocate,
    denied: false,
  })

  // Only sets state from async callbacks, so it is safe to call inside an effect
  const locate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setState({
          latitude: coords.latitude,
          longitude: coords.longitude,
          loading: false,
          denied: false,
        })
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
  }, [locate, autoLocate])

  const request = useCallback(() => {
    if (!isSupported) return
    setState((prev) => ({ ...prev, loading: true }))
    locate()
  }, [locate])

  return { ...state, supported: isSupported, request }
}
