import { useState, useCallback, useRef } from 'react'
import type {
  Units,
  WeatherResponse,
  WeatherCurrent,
  WeatherDaily,
  WeatherHourly,
  WeatherMinutely15,
  YesterdayHourly,
} from '../types'
import { splitPastDay } from '../utils'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'
// The current 15-minute step and 2 hours after it
const NOWCAST_STEPS = 9

interface UseWeatherReturn {
  weather: WeatherCurrent | null
  forecast: WeatherDaily | null
  hourly: WeatherHourly | null
  /** Precipitation for the next 2 hours; null for a saved copy, where it is out of date */
  minutely: WeatherMinutely15 | null
  timezone: string | null
  updatedAt: Date | null
  /** Units of the data on screen (may lag behind the chosen ones until the refetch arrives) */
  units: Units | null
  /** Yesterday's hourly temperatures, to compare the current one with */
  yesterday: YesterdayHourly | null
  /** The data is the service worker's copy from an earlier visit: the network request failed */
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

// Set by the service worker on its saved copy (vite.config.ts): the network request failed
const CACHED_AT_HEADER = 'X-Weatherly-Cached-At'

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null)
  const [forecast, setForecast] = useState<WeatherDaily | null>(null)
  const [hourly, setHourly] = useState<WeatherHourly | null>(null)
  const [minutely, setMinutely] = useState<WeatherMinutely15 | null>(null)
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

      // The response includes yesterday: split it off the forecast
      const show = (raw: WeatherResponse, at: Date, cached: boolean) => {
        const { data, yesterday: pastDay } = splitPastDay(raw)
        setYesterday(pastDay)
        setWeather(data.current)
        setForecast(data.daily)
        setHourly(data.hourly)
        setMinutely(cached ? null : data.minutely_15)
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
          [
            'temperature_2m',
            'apparent_temperature',
            'wind_speed_10m',
            'wind_direction_10m',
            'precipitation',
            'weather_code',
            'precipitation_probability',
            'is_day',
          ].join(','),
        )
        url.searchParams.set('minutely_15', 'precipitation,snowfall')
        url.searchParams.set('forecast_minutely_15', String(NOWCAST_STEPS))
        url.searchParams.set('past_minutely_15', '0')
        url.searchParams.set('temperature_unit', requestedUnits.temperature)
        url.searchParams.set('wind_speed_unit', requestedUnits.wind)
        url.searchParams.set('timezone', 'auto')
        url.searchParams.set('forecast_days', '16')
        url.searchParams.set('past_days', '1')

        const res = await globalThis.fetch(url)
        if (!isLatest()) return
        if (!res.ok) {
          setError('fetch_failed')
          return
        }

        const data: WeatherResponse = await res.json()
        if (!isLatest()) return
        const cachedAt = res.headers.get(CACHED_AT_HEADER)
        show(data, cachedAt ? new Date(cachedAt) : new Date(), cachedAt !== null)
      } catch {
        // No network and no saved copy of this place
        if (isLatest()) setError('fetch_failed')
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
    minutely,
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
