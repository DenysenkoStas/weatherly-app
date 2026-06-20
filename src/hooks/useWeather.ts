import { useState, useCallback } from 'react'
import type { WeatherResponse, WeatherCurrent, WeatherDaily } from '../types'

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast'

interface UseWeatherReturn {
  weather: WeatherCurrent | null
  forecast: WeatherDaily | null
  updatedAt: Date | null
  loading: boolean
  error: string | null
  fetch: (lat: number, lon: number) => Promise<void>
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null)
  const [forecast, setForecast] = useState<WeatherDaily | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (lat: number, lon: number) => {
    setLoading(true)
    setError(null)

    try {
      const url = new URL(WEATHER_API)
      url.searchParams.set('latitude', String(lat))
      url.searchParams.set('longitude', String(lon))
      url.searchParams.set(
        'current',
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      )
      url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
      url.searchParams.set('wind_speed_unit', 'ms')
      url.searchParams.set('timezone', 'auto')
      url.searchParams.set('forecast_days', '7')

      const res = await globalThis.fetch(url)
      if (!res.ok) throw new Error()

      const data: WeatherResponse = await res.json()
      setWeather(data.current)
      setForecast(data.daily)
      setUpdatedAt(new Date())
    } catch {
      setError('fetch_failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return { weather, forecast, updatedAt, loading, error, fetch }
}
