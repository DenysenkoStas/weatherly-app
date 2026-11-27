import { useState, useCallback } from 'react'
import type { Language } from '../types'
import { useLatestRequest } from './useLatestRequest'

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse'
const USER_AGENT = 'Weatherly/1.0 (https://denysenkostas.github.io/weatherly-app)'
// Nominatim's usage policy allows at most 1 request per second
const MIN_INTERVAL_MS = 1000

// Module-level, so the limit holds for every use of the hook
let lastRequestAt = 0

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true },
    )
  })
}

interface UseReverseGeocodingReturn {
  cityName: string | null
  loading: boolean
  fetchCityName: (lat: number, lon: number) => Promise<void>
}

export function useReverseGeocoding(language: Language): UseReverseGeocodingReturn {
  const [cityName, setCityName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // A slow name for the previous place must not replace the current one
  const { start } = useLatestRequest()

  const fetchCityName = useCallback(
    async (lat: number, lon: number) => {
      const signal = start()
      setLoading(true)

      try {
        // Too soon after the previous request: wait; a place replaced meanwhile is never requested
        const delay = lastRequestAt + MIN_INTERVAL_MS - Date.now()
        if (delay > 0) await wait(delay, signal)
        if (signal.aborted) return
        lastRequestAt = Date.now()

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
          signal,
        })
        if (signal.aborted) return
        if (!res.ok) {
          setCityName(null)
          return
        }

        const data = await res.json()
        if (signal.aborted) return
        const name =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          null
        setCityName(name)
      } catch {
        // Aborted by a newer request; otherwise offline and the service worker has no saved name
        if (!signal.aborted) setCityName(null)
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    },
    [language, start],
  )

  return { cityName, loading, fetchCityName }
}
