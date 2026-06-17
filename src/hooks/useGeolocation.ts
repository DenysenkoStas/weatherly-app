import { useEffect, useState } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  loading: boolean
}

const isSupported = typeof navigator !== 'undefined' && !!navigator.geolocation

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: isSupported,
  })

  useEffect(() => {
    if (!isSupported) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setState({
          latitude: coords.latitude,
          longitude: coords.longitude,
          loading: false,
        })
      },
      () => {
        setState({ latitude: null, longitude: null, loading: false })
      },
    )
  }, [])

  return state
}
