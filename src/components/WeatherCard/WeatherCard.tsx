import thermometerIcon from '@meteocons/svg/fill/thermometer.svg?url'
import humidityIcon from '@meteocons/svg/fill/humidity.svg?url'
import windIcon from '@meteocons/svg/fill/wind.svg?url'
import barometerIcon from '@meteocons/svg/fill/barometer.svg?url'
import uvIndexIcon from '@meteocons/svg/fill/uv-index.svg?url'
import raindropIcon from '@meteocons/svg/fill/raindrop.svg?url'
import sunriseIcon from '@meteocons/svg/fill/sunrise.svg?url'
import sunsetIcon from '@meteocons/svg/fill/sunset.svg?url'
import type { ReactNode } from 'react'
import type { WeatherCurrent } from '../../types'
import {
  formatDuration,
  formatHour,
  getCompassIndex,
  getDaylightProgress,
  getUvLevel,
} from '../../utils'
import type { UvLevel } from '../../utils'
import { getWeatherIcon } from '../../utils/wmoIcons'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations {
  feels_like: string
  humidity: string
  wind: string
  wind_unit: string
  temp_unit: string
  pressure: string
  pressure_unit: string
  uv_index: string
  uv_levels: Record<UvLevel, string>
  precipitation_amount: string
  precipitation_unit: string
  directions: readonly string[]
  sunrise: string
  sunset: string
  daylight: string
  hours_short: string
  minutes_short: string
  updated_at: string
  add_favorite: string
  remove_favorite: string
}

export interface SunTimes {
  sunrise: string
  sunset: string
  daylightDuration: number
}

interface WeatherCardProps {
  city: string
  weather: WeatherCurrent
  sun: SunTimes | null
  description: string
  updatedAt: Date
  isFavorite: boolean
  onRefresh: () => void
  onToggleFavorite: () => void
  t: WeatherCardTranslations
}

interface DetailProps {
  icon: string
  label: string
  value: ReactNode
  hint?: string
}

function Detail({ icon, label, value, hint }: DetailProps) {
  return (
    <div className={styles.detail}>
      <img className={styles.detailIcon} src={icon} alt="" width={36} height={36} />
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}

export function WeatherCard({
  city,
  weather,
  sun,
  description,
  updatedAt,
  isFavorite,
  onRefresh,
  onToggleFavorite,
  t,
}: WeatherCardProps) {
  const time = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const direction = t.directions[getCompassIndex(weather.wind_direction_10m)]
  const uvLevel = getUvLevel(weather.uv_index)
  const daylightProgress = sun ? getDaylightProgress(sun.sunrise, sun.sunset, weather.time) : null

  return (
    <div className={styles.card}>
      <button className={styles.refresh} onClick={onRefresh} aria-label="Refresh">
        ↻
      </button>
      <button
        className={`${styles.favorite}${isFavorite ? ` ${styles.favoriteActive}` : ''}`}
        onClick={onToggleFavorite}
        aria-label={isFavorite ? t.remove_favorite : t.add_favorite}
      >
        {isFavorite ? '★' : '☆'}
      </button>

      <div className={styles.top}>
        <h2 className={styles.city}>{city}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <img
        className={styles.icon}
        src={getWeatherIcon(weather.weather_code, weather.is_day === 1)}
        alt={description}
      />

      <div className={styles.temp}>
        {Math.round(weather.temperature_2m)}
        {t.temp_unit}
      </div>

      <div className={styles.details}>
        <Detail
          icon={thermometerIcon}
          label={t.feels_like}
          value={`${Math.round(weather.apparent_temperature)}${t.temp_unit}`}
        />
        <Detail icon={humidityIcon} label={t.humidity} value={`${weather.relative_humidity_2m}%`} />
        <Detail
          icon={windIcon}
          label={t.wind}
          value={
            <>
              <svg
                className={styles.windArrow}
                style={{ transform: `rotate(${weather.wind_direction_10m + 180}deg)` }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20V4M6 10l6-6 6 6" />
              </svg>
              {Math.round(weather.wind_speed_10m)} {t.wind_unit}
            </>
          }
          hint={direction}
        />
        <Detail
          icon={barometerIcon}
          label={t.pressure}
          value={`${Math.round(weather.pressure_msl)} ${t.pressure_unit}`}
        />
        <Detail
          icon={uvIndexIcon}
          label={t.uv_index}
          value={Math.round(weather.uv_index)}
          hint={t.uv_levels[uvLevel]}
        />
        <Detail
          icon={raindropIcon}
          label={t.precipitation_amount}
          value={`${Number(weather.precipitation.toFixed(1))} ${t.precipitation_unit}`}
        />
      </div>

      {sun && (
        <div className={styles.sun}>
          <div className={styles.sunEnd}>
            <img className={styles.sunIcon} src={sunriseIcon} alt="" width={40} height={40} />
            <span className={styles.sunTime}>{formatHour(sun.sunrise)}</span>
            <span className={styles.label}>{t.sunrise}</span>
          </div>

          <div className={styles.sunMiddle}>
            <div className={styles.sunTrack}>
              {daylightProgress !== null && (
                <>
                  <div className={styles.sunFill} style={{ width: `${daylightProgress * 100}%` }} />
                  <div className={styles.sunDot} style={{ left: `${daylightProgress * 100}%` }} />
                </>
              )}
            </div>
            <span className={styles.hint}>
              {t.daylight} {formatDuration(sun.daylightDuration, t)}
            </span>
          </div>

          <div className={styles.sunEnd}>
            <img className={styles.sunIcon} src={sunsetIcon} alt="" width={40} height={40} />
            <span className={styles.sunTime}>{formatHour(sun.sunset)}</span>
            <span className={styles.label}>{t.sunset}</span>
          </div>
        </div>
      )}

      <p className={styles.updatedAt}>
        {t.updated_at} {time}
      </p>
    </div>
  )
}
