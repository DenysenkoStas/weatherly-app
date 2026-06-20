import type { WeatherCurrent } from '../../types'
import { getWeatherIcon } from '../../utils/wmoIcons'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations {
  feels_like: string
  humidity: string
  wind: string
  wind_unit: string
  temp_unit: string
  updated_at: string
}

interface WeatherCardProps {
  city: string
  weather: WeatherCurrent
  description: string
  updatedAt: Date
  onRefresh: () => void
  t: WeatherCardTranslations
}

export function WeatherCard({
  city,
  weather,
  description,
  updatedAt,
  onRefresh,
  t,
}: WeatherCardProps) {
  const time = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={styles.card}>
      <button className={styles.refresh} onClick={onRefresh} aria-label="Refresh">
        ↻
      </button>

      <div className={styles.top}>
        <h2 className={styles.city}>{city}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <img className={styles.icon} src={getWeatherIcon(weather.weather_code)} alt={description} />

      <div className={styles.temp}>
        {Math.round(weather.temperature_2m)}
        {t.temp_unit}
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>{t.feels_like}</span>
          <span className={styles.value}>
            {Math.round(weather.apparent_temperature)}
            {t.temp_unit}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>{t.humidity}</span>
          <span className={styles.value}>{weather.relative_humidity_2m}%</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>{t.wind}</span>
          <span className={styles.value}>
            {Math.round(weather.wind_speed_10m)} {t.wind_unit}
          </span>
        </div>
      </div>

      <p className={styles.updatedAt}>
        {t.updated_at} {time}
      </p>
    </div>
  )
}
