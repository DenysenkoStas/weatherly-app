import { useEffect, useMemo, useState } from 'react'
import type { FavoriteCity, TemperatureUnit } from '../types'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
const NONE: Readonly<Record<string, number>> = {}

interface CurrentTemperature {
  current?: { temperature_2m?: number | null }
}

interface Temperatures {
  unit: TemperatureUnit
  /** By favorite id */
  values: Record<string, number>
}

/**
 * Current temperatures of the favorite cities, from one request for all of them.
 * Favorite ids are their rounded coordinates, so reordering the chips needs no new request.
 * `refreshKey` asks again when it changes (e.g. whenever the main forecast is updated).
 * Empty until loaded and when the request fails (offline).
 */
export function useFavoritesWeather(
  favorites: FavoriteCity[],
  unit: TemperatureUnit,
  refreshKey?: unknown,
): Readonly<Record<string, number>> {
  const [temperatures, setTemperatures] = useState<Temperatures | null>(null)
  const ids = useMemo(
    () =>
      favorites
        .map((city) => city.id)
        .sort()
        .join(';'),
    [favorites],
  )

  useEffect(() => {
    if (!ids) return
    const places = ids.split(';')
    const coords = places.map((id) => id.split(','))

    const url = new URL(WEATHER_API)
    url.searchParams.set('latitude', coords.map(([lat]) => lat).join(','))
    url.searchParams.set('longitude', coords.map(([, lon]) => lon).join(','))
    url.searchParams.set('current', 'temperature_2m')
    url.searchParams.set('temperature_unit', unit)

    const controller = new AbortController()
    globalThis
      .fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: CurrentTemperature | CurrentTemperature[]) => {
        // One place comes back as an object, several as a list in the requested order
        const list = Array.isArray(data) ? data : [data]
        const values: Record<string, number> = {}
        places.forEach((id, i) => {
          const temperature = list[i]?.current?.temperature_2m
          if (typeof temperature === 'number') values[id] = temperature
        })
        setTemperatures({ unit, values })
      })
      .catch(() => {
        // A newer request replaced this one; otherwise offline or an API error: no numbers
        if (!controller.signal.aborted) setTemperatures(null)
      })

    return () => controller.abort()
  }, [ids, unit, refreshKey])

  // Until the new units arrive, temperatures in the old ones are not shown
  return temperatures?.unit === unit ? temperatures.values : NONE
}
