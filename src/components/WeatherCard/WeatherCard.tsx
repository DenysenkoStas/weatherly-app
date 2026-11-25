import { useId } from 'react'
import type { WeatherCurrent } from '../../types'
import type { YesterdayComparison } from '../../utils'
import { WeatherDetails } from '../WeatherDetails'
import type { SunTimes, WeatherDetailsTranslations } from '../WeatherDetails'
import { getWeatherIcon } from '../../utils/wmoIcons'
import { MeteoIcon } from '../MeteoIcon'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations extends WeatherDetailsTranslations {
  updated_at: string
  updated_on: string
  offline: string
  colder_than_yesterday: string
  warmer_than_yesterday: string
  same_as_yesterday: string
  yesterday_at: string
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
  // The data is a saved copy shown without network
  offline?: boolean
  // Current temperature against the same hour yesterday
  comparison?: YesterdayComparison | null
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
  offline = false,
  comparison = null,
  refreshing = false,
  onRefresh,
  onToggleFavorite,
  showDetails = true,
  t,
}: WeatherCardProps) {
  const cityId = useId()
  const time = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  // An offline copy can be from another day: then show the date too
  const isToday = updatedAt.toDateString() === new Date().toDateString()
  const stamp = isToday
    ? `${t.updated_at} ${time}`
    : `${t.updated_on} ${updatedAt.toLocaleDateString([], { day: 'numeric', month: 'short' })}, ${time}`

  const yesterdayDetail = comparison
    ? t.yesterday_at
        .replace('{time}', comparison.hour)
        .replace('{temp}', `${comparison.yesterdayTemperature}${t.temp_unit}`)
    : undefined

  return (
    <section
      className={`${styles.card}${showDetails ? '' : ` ${styles.cardCompact}`}`}
      aria-labelledby={cityId}
    >
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
        <h2 id={cityId} className={styles.city}>
          {city}
        </h2>
        <p className={styles.description}>{description}</p>
      </div>

      <MeteoIcon
        className={styles.icon}
        icon={getWeatherIcon(weather.weather_code, weather.is_day === 1)}
        alt={description}
      />

      <div className={styles.tempBlock}>
        <div className={styles.temp}>
          {Math.round(weather.temperature_2m)}
          {t.temp_unit}
        </div>
        {comparison && (
          <p className={styles.comparison} title={yesterdayDetail}>
            {comparison.difference === 0
              ? t.same_as_yesterday
              : (comparison.difference < 0
                  ? t.colder_than_yesterday
                  : t.warmer_than_yesterday
                ).replace('{n}', String(Math.abs(comparison.difference)))}
            {/* The tooltip only shows on hover, screen readers get the detail as text */}
            <span className={styles.visuallyHidden}>. {yesterdayDetail}</span>
          </p>
        )}
      </div>

      {showDetails && <WeatherDetails weather={weather} sun={sun} t={t} />}

      <p className={styles.updatedAt}>
        {stamp}
        {offline && <span className={styles.offline}> · {t.offline}</span>}
      </p>
    </section>
  )
}
