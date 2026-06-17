import type { WeatherCurrent } from '../../types'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations {
  feels_like: string
  humidity: string
  wind: string
  wind_unit: string
  temp_unit: string
}

interface WeatherCardProps {
  city: string
  weather: WeatherCurrent
  description: string
  t: WeatherCardTranslations
}

export function WeatherCard({ city, weather, description, t }: WeatherCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <h2 className={styles.city}>{city}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.temp}>
        {Math.round(weather.temperature_2m)}{t.temp_unit}
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>{t.feels_like}</span>
          <span className={styles.value}>
            {Math.round(weather.apparent_temperature)}{t.temp_unit}
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
    </div>
  )
}
