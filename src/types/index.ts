import type { en, uk } from '../locales'

export type Language = 'en' | 'uk'
export type Theme = 'light' | 'dark'
export type Translations = typeof en | typeof uk

export interface FavoriteCity {
  id: string
  name: string
  latitude: number
  longitude: number
}

export interface GeoResult {
  id: number
  name: string
  country: string
  country_code: string
  admin1?: string
  latitude: number
  longitude: number
}

export interface GeoResponse {
  results?: GeoResult[]
}

export interface WeatherCurrent {
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  wind_speed_10m: number
  weather_code: number
}

export interface WeatherDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
}

export interface WeatherResponse {
  current: WeatherCurrent
  daily: WeatherDaily
}
