import { useCallback, useRef, useState } from 'react'
import type { AirQualityCurrent, AirQualityResponse } from '../types'

const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality'

const CURRENT_FIELDS = [
  'european_aqi',
  'pm2_5',
  'pm10',
  'alder_pollen',
  'birch_pollen',
  'grass_pollen',
  'mugwort_pollen',
  'olive_pollen',
  'ragweed_pollen',
]

interface FetchOptions {
  /** Same place: keep the current data until the new one arrives */
  silent?: boolean
}

// Air quality is extra information: on failure the card is simply hidden, no error message
export function useAirQuality() {
  const [airQuality, setAirQuality] = useState<AirQualityCurrent | null>(null)
  const requestIdRef = useRef(0)

  const fetch = useCallback(
    async (lat: number, lon: number, { silent = false }: FetchOptions = {}) => {
      const requestId = ++requestIdRef.current
      const isLatest = () => requestId === requestIdRef.current

      // A new place must not show the previous city's air
      if (!silent) setAirQuality(null)

      try {
        const url = new URL(AIR_QUALITY_API)
        url.searchParams.set('latitude', String(lat))
        url.searchParams.set('longitude', String(lon))
        url.searchParams.set('current', CURRENT_FIELDS.join(','))
        url.searchParams.set('timezone', 'auto')

        const res = await globalThis.fetch(url)
        if (!isLatest()) return
        if (!res.ok) {
          if (!silent) setAirQuality(null)
          return
        }

        const data: AirQualityResponse = await res.json()
        if (isLatest()) setAirQuality(data.current)
      } catch {
        // Keep whatever is on screen; nothing to report
      }
    },
    [],
  )

  return { airQuality, fetch }
}
