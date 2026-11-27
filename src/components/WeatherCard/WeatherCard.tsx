import { useId } from 'react'
import type { WeatherCurrent } from '../../types'
import type { Nowcast, NowcastKind, PrecipitationType, YesterdayComparison } from '../../utils'
import { WeatherDetails } from '../WeatherDetails'
import type { SunTimes, WeatherDetailsTranslations } from '../WeatherDetails'
import { getPrecipitationIcon, getWeatherIcon } from '../../utils/wmoIcons'
import { MeteoIcon } from '../MeteoIcon'
import { CheckIcon, ShareIcon } from '../ThemeIcons'
import styles from './WeatherCard.module.scss'

interface WeatherCardTranslations extends WeatherDetailsTranslations {
  updated_at: string
  updated_on: string
  offline: string
  colder_than_yesterday: string
  warmer_than_yesterday: string
  same_as_yesterday: string
  yesterday_at: string
  nowcast: Record<PrecipitationType, Record<NowcastKind, string>>
  refresh: string
  share: string
  link_copied: string
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
  // Rain or snow starting or stopping within the next 2 hours
  nowcast?: Nowcast | null
  // A silent refresh is running
  refreshing?: boolean
  onRefresh: () => void
  onShare: () => void
  // The link was just copied (where the browser has no share sheet)
  shareCopied?: boolean
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
  nowcast = null,
  refreshing = false,
  onRefresh,
  onShare,
  shareCopied = false,
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
      <button className={styles.share} onClick={onShare} aria-label={t.share} title={t.share}>
        {shareCopied ? (
          <CheckIcon className={styles.shareIcon} />
        ) : (
          <ShareIcon className={styles.shareIcon} />
        )}
      </button>
      <p className={styles.visuallyHidden} role="status">
        {shareCopied ? t.link_copied : ''}
      </p>
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
          // The detail stays visible: touch screens can't hover for a tooltip
          <div className={styles.comparison}>
            <p className={styles.comparisonSummary}>
              {comparison.difference === 0
                ? t.same_as_yesterday
                : (comparison.difference < 0
                    ? t.colder_than_yesterday
                    : t.warmer_than_yesterday
                  ).replace('{n}', String(Math.abs(comparison.difference)))}
            </p>
            <p className={styles.comparisonDetail}>{yesterdayDetail}</p>
          </div>
        )}
      </div>

      {nowcast && (
        <p className={styles.nowcast}>
          <MeteoIcon className={styles.nowcastIcon} icon={getPrecipitationIcon(nowcast.type)} />
          {nowcast.kind === 'ongoing'
            ? t.nowcast[nowcast.type].ongoing
            : t.nowcast[nowcast.type][nowcast.kind].replace('{time}', nowcast.time)}
        </p>
      )}

      {showDetails && <WeatherDetails weather={weather} sun={sun} t={t} />}

      <p className={styles.updatedAt}>
        {stamp}
        {offline && <span className={styles.offline}> · {t.offline}</span>}
      </p>
    </section>
  )
}
