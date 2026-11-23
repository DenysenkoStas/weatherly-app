import { useState, useCallback } from 'react'
import type { Language } from '../types'
import { makeFavoriteId } from './useFavorites'

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'Weatherly/1.0 (https://denysenkostas.github.io/weatherly-app)'
// The last resolved name, so an offline start can still title the saved forecast
const LAST_NAME_KEY = 'weatherly_last_city_name'

interface SavedName {
  lat: number
  lon: number
  name: string
}

function loadSavedName(lat: number, lon: number): string | null {
  try {
    const saved: SavedName | null = JSON.parse(localStorage.getItem(LAST_NAME_KEY) ?? 'null')
    // Compared rounded, like the page link, so a search result and its rounded link match
    return saved && makeFavoriteId(saved.lat, saved.lon) === makeFavoriteId(lat, lon)
      ? saved.name
      : null
  } catch {
    return null
  }
}

function saveName(saved: SavedName): void {
  try {
    localStorage.setItem(LAST_NAME_KEY, JSON.stringify(saved))
  } catch {
    // Not critical
  }
}

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
        if (!res.ok) {
          setCityName(null)
          return
        }

        const data = await res.json()
        const name =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          null
        setCityName(name)
        if (name) saveName({ lat, lon, name })
      } catch {
        // Offline: reuse the name saved for these coordinates (possibly in the other language)
        setCityName(loadSavedName(lat, lon))
      } finally {
        setLoading(false)
      }
    },
    [language],
  )

  return { cityName, loading, fetchCityName }
}
