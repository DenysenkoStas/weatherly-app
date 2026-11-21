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

export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: isSupported,
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
    if (!isSupported) return
    locate()
  }, [locate])

  const request = useCallback(() => {
    if (!isSupported) return
    setState((prev) => ({ ...prev, loading: true }))
    locate()
  }, [locate])

  return { ...state, supported: isSupported, request }
}
