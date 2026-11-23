import { useState, useCallback, useRef } from 'react'
import { makeFavoriteId } from './useFavorites'
import type {
  Units,
  WeatherResponse,
  WeatherCurrent,
  WeatherDaily,
  WeatherHourly,
  YesterdayHourly,
} from '../types'
import { splitPastDay } from '../utils'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

interface UseWeatherReturn {
  weather: WeatherCurrent | null
  forecast: WeatherDaily | null
  hourly: WeatherHourly | null
  timezone: string | null
  updatedAt: Date | null
  /** Units of the data on screen (may lag behind the chosen ones until the refetch arrives) */
  units: Units | null
  /** Yesterday's hourly temperatures, to compare the current one with */
  yesterday: YesterdayHourly | null
  /** The data is the saved copy from an earlier visit: the network request failed */
  fromCache: boolean
  loading: boolean
  /** A silent refresh is running: the current data stays on screen */
  refreshing: boolean
  error: string | null
  fetch: (lat: number, lon: number, options?: FetchOptions) => Promise<void>
}

interface FetchOptions {
  /** Keep showing the current data instead of a skeleton (refresh of the same place) */
  silent?: boolean
  units?: Units
}

const DEFAULT_UNITS: Units = { temperature: 'celsius', wind: 'ms' }

// The last successful forecast, shown when the network is gone (offline start of the installed app)
const SNAPSHOT_KEY = 'weatherly_last_weather'

interface WeatherSnapshot {
  key: string
  savedAt: string
  data: WeatherResponse
}

// Rounded like the page link (?lat=…&lon=…): a city opened from search and the same city
// reopened from the rounded link must find the same copy
function snapshotKey(lat: number, lon: number, units: Units): string {
  return `${makeFavoriteId(lat, lon)},${units.temperature},${units.wind}`
}

function saveSnapshot(snapshot: WeatherSnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot))
  } catch {
    // Storage full or disabled: there is just no offline copy
  }
}

function loadSnapshot(key: string): WeatherSnapshot | null {
  try {
    const snapshot: WeatherSnapshot | null = JSON.parse(
      localStorage.getItem(SNAPSHOT_KEY) ?? 'null',
    )
    return snapshot?.key === key && snapshot.data?.current ? snapshot : null
  } catch {
    return null
  }
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null)
  const [forecast, setForecast] = useState<WeatherDaily | null>(null)
  const [hourly, setHourly] = useState<WeatherHourly | null>(null)
  const [timezone, setTimezone] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [units, setUnits] = useState<Units | null>(null)
  const [yesterday, setYesterday] = useState<YesterdayHourly | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Only the latest request may update the state, so a slow answer for the previous city is dropped
  const requestIdRef = useRef(0)

  const fetch = useCallback(
    async (
      lat: number,
      lon: number,
      { silent = false, units: requestedUnits = DEFAULT_UNITS }: FetchOptions = {},
    ) => {
      const requestId = ++requestIdRef.current
      const isLatest = () => requestId === requestIdRef.current
      const key = snapshotKey(lat, lon, requestedUnits)

      // The response (and its saved copy) includes yesterday: split it off the forecast
      const show = (raw: WeatherResponse, at: Date, cached: boolean) => {
        const { data, yesterday: pastDay } = splitPastDay(raw)
        setYesterday(pastDay)
        setWeather(data.current)
        setForecast(data.daily)
        setHourly(data.hourly)
        setTimezone(data.timezone)
        setUpdatedAt(at)
        setUnits(requestedUnits)
        setFromCache(cached)
      }

      setLoading(!silent)
      setRefreshing(silent)
      setError(null)

      try {
        const url = new URL(WEATHER_API)
        url.searchParams.set('latitude', String(lat))
        url.searchParams.set('longitude', String(lon))
        url.searchParams.set(
          'current',
          [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'wind_speed_10m',
            'wind_direction_10m',
            'pressure_msl',
            'precipitation',
            'uv_index',
            'is_day',
            'weather_code',
          ].join(','),
        )
        url.searchParams.set(
          'daily',
          'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration,precipitation_probability_max',
        )
        url.searchParams.set(
          'hourly',
          'temperature_2m,weather_code,precipitation_probability,is_day',
        )
        url.searchParams.set('temperature_unit', requestedUnits.temperature)
        url.searchParams.set('wind_speed_unit', requestedUnits.wind)
        url.searchParams.set('timezone', 'auto')
        url.searchParams.set('forecast_days', '7')
        url.searchParams.set('past_days', '1')

        const res = await globalThis.fetch(url)
        if (!isLatest()) return
        if (!res.ok) {
          setError('fetch_failed')
          return
        }

        const data: WeatherResponse = await res.json()
        if (!isLatest()) return
        const now = new Date()
        show(data, now, false)
        saveSnapshot({ key, savedAt: now.toISOString(), data })
      } catch {
        if (!isLatest()) return
        // No network: fall back to the saved forecast of the same place, if there is one
        const snapshot = loadSnapshot(key)
        if (snapshot) show(snapshot.data, new Date(snapshot.savedAt), true)
        else setError('fetch_failed')
      } finally {
        if (isLatest()) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [],
  )

  return {
    weather,
    forecast,
    hourly,
    timezone,
    updatedAt,
    units,
    yesterday,
    fromCache,
    loading,
    refreshing,
    error,
    fetch,
  }
}
