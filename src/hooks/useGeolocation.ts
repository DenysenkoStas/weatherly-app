import { useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
  denied: boolean
}

const isSupported = typeof navigator !== 'undefined' && !!navigator.geolocation

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: isSupported,
    denied: false,
  })

  useEffect(() => {
    if (!isSupported) return

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

  return state
}
