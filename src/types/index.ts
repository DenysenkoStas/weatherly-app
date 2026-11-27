import type { en, uk } from '../locales'

export type Language = 'en' | 'uk'
export type Theme = 'light' | 'dark'
/** Icon animation: `auto` follows the system reduced-motion setting */
export type Motion = 'auto' | 'on' | 'off'
export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'ms' | 'kmh'

export interface Units {
  temperature: TemperatureUnit
  wind: WindUnit
}
export type Translations = typeof en | typeof uk

export interface Coords {
  lat: number
  lon: number
}

export interface AirQualityCurrent {
  european_aqi: number | null
  pm2_5: number | null
  pm10: number | null
  // Pollen is only modelled for Europe and is null elsewhere
  alder_pollen: number | null
  birch_pollen: number | null
  grass_pollen: number | null
  mugwort_pollen: number | null
  olive_pollen: number | null
  ragweed_pollen: number | null
}

export interface AirQualityResponse {
  current: AirQualityCurrent
}

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
  time: string
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  wind_speed_10m: number
  wind_direction_10m: number
  pressure_msl: number
  precipitation: number
  uv_index: number
  is_day: number
  weather_code: number
}

export interface WeatherDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  sunrise: string[]
  sunset: string[]
  daylight_duration: number[]
  // null when the model has no probability for that day
  precipitation_probability_max: (number | null)[]
}

export interface WeatherHourly {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  // mm over the hour before the time
  precipitation: number[]
  weather_code: number[]
  precipitation_probability: number[]
  is_day: number[]
}

/** Precipitation by 15 minutes; each value is the sum of the 15 minutes before its time */
export interface WeatherMinutely15 {
  time: string[]
  // mm of water, snow included
  precipitation: (number | null)[]
  // cm of fresh snow
  snowfall: (number | null)[]
}

/** Hourly temperatures of the day before today (from `past_days=1`) */
export type YesterdayHourly = Pick<WeatherHourly, 'time' | 'temperature_2m'>

export interface WeatherResponse {
  timezone: string
  current: WeatherCurrent
  daily: WeatherDaily
  hourly: WeatherHourly
  // Missing in offline copies saved before it was requested
  minutely_15?: WeatherMinutely15
}

/** A Meteocons icon: animated, and a still copy for when motion is off */
export interface IconSources {
  animated: string
  still: string
}
