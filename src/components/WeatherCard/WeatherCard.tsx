import type { WeatherCurrent } from '../../types'
import { WeatherDetails } from '../WeatherDetails'
import type { SunTimes, WeatherDetailsTranslations } from '../WeatherDetails'
import { getWeatherIcon } from '../../utils/wmoIcons'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations extends WeatherDetailsTranslations {
  updated_at: string
  refresh: string
  add_favorite: string
  remove_favorite: string
}

interface WeatherCardProps {
  city: string
  weather: WeatherCurrent
  sun: SunTimes | null
  description: string
  updatedAt: Date
  isFavorite: boolean
  // A silent refresh is running
  refreshing?: boolean
  onRefresh: () => void
  onToggleFavorite: () => void
  // On desktop the details live in a card of their own next to the forecast
  showDetails?: boolean
  t: WeatherCardTranslations
}

export function WeatherCard({
  city,
  weather,
  sun,
  description,
  updatedAt,
  isFavorite,
  refreshing = false,
  onRefresh,
  onToggleFavorite,
  showDetails = true,
  t,
}: WeatherCardProps) {
  const time = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`${styles.card}${showDetails ? '' : ` ${styles.cardCompact}`}`}>
      <button
        className={styles.refresh}
        onClick={onRefresh}
        disabled={refreshing}
        aria-label={t.refresh}
        aria-busy={refreshing}
        title={t.refresh}
      >
        <span className={refreshing ? styles.refreshSpinning : undefined} aria-hidden="true">
          ↻
        </span>
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

      {showDetails && <WeatherDetails weather={weather} sun={sun} t={t} />}

      <p className={styles.updatedAt}>
        {t.updated_at} {time}
      </p>
    </div>
  )
}
