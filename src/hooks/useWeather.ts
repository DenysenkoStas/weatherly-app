import { useState, useCallback, useRef } from 'react'
import type { WeatherResponse, WeatherCurrent, WeatherDaily, WeatherHourly } from '../types'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

interface UseWeatherReturn {
  weather: WeatherCurrent | null
  forecast: WeatherDaily | null
  hourly: WeatherHourly | null
  timezone: string | null
  updatedAt: Date | null
  loading: boolean
  /** A silent refresh is running: the current data stays on screen */
  refreshing: boolean
  error: string | null
  fetch: (lat: number, lon: number, options?: FetchOptions) => Promise<void>
}

interface FetchOptions {
  /** Keep showing the current data instead of a skeleton (refresh of the same place) */
  silent?: boolean
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null)
  const [forecast, setForecast] = useState<WeatherDaily | null>(null)
  const [hourly, setHourly] = useState<WeatherHourly | null>(null)
  const [timezone, setTimezone] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Only the latest request may update the state, so a slow answer for the previous city is dropped
  const requestIdRef = useRef(0)

  const fetch = useCallback(
    async (lat: number, lon: number, { silent = false }: FetchOptions = {}) => {
      const requestId = ++requestIdRef.current
      const isLatest = () => requestId === requestIdRef.current

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
          'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration',
        )
        url.searchParams.set(
          'hourly',
          'temperature_2m,weather_code,precipitation_probability,is_day',
        )
        url.searchParams.set('wind_speed_unit', 'ms')
        url.searchParams.set('timezone', 'auto')
        url.searchParams.set('forecast_days', '7')

        const res = await globalThis.fetch(url)
        if (!isLatest()) return
        if (!res.ok) {
          setError('fetch_failed')
          return
        }

        const data: WeatherResponse = await res.json()
        if (!isLatest()) return
        setWeather(data.current)
        setForecast(data.daily)
        setHourly(data.hourly)
        setTimezone(data.timezone)
        setUpdatedAt(new Date())
      } catch {
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

  return { weather, forecast, hourly, timezone, updatedAt, loading, refreshing, error, fetch }
}
