import { useState, useCallback } from 'react'
import type { Language } from '../types'

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'Weatherly/1.0 (https://denysenkostas.github.io/weatherly-app)'

interface UseReverseGeocodingReturn {
  cityName: string | null
  loading: boolean
  fetchCityName: (lat: number, lon: number) => Promise<void>
}

export function useReverseGeocoding(language: Language): UseReverseGeocodingReturn {
  const [cityName, setCityName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCityName = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true)

      try {
        const url = new URL(NOMINATIM_API)
        url.searchParams.set('lat', String(lat))
        url.searchParams.set('lon', String(lon))
        url.searchParams.set('format', 'json')
        url.searchParams.set('accept-language', language)

        const res = await fetch(url, {
          headers: {
            'Accept-Language': language,
            'User-Agent': USER_AGENT,
          },
        })
        if (!res.ok) throw new Error()

        const data = await res.json()
        const name =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          null
        setCityName(name)
      } catch {
        setCityName(null)
      } finally {
        setLoading(false)
      }
    },
    [language],
  )

  return { cityName, loading, fetchCityName }
}
