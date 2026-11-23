import { useId } from 'react'
import type { AirQualityCurrent } from '../../types'
import { AQI_LEVELS, getAqiLevel, getAqiScalePosition, getPollenReadings } from '../../utils'
import type { AqiLevel, PollenLevel, PollenType } from '../../utils'
import styles from './AirQualityCard.module.scss'

interface AirQualityCardTranslations {
  air_quality: string
  aqi_levels: Record<AqiLevel, string>
  pm_unit: string
  pollen: string
  pollen_types: Record<PollenType, string>
  pollen_levels: Record<PollenLevel, string>
}

interface AirQualityCardProps {
  airQuality: AirQualityCurrent
  t: AirQualityCardTranslations
}

function formatPm(value: number | null): string {
  return value === null ? '—' : String(Math.round(value))
}

export function AirQualityCard({ airQuality, t }: AirQualityCardProps) {
  const titleId = useId()
  const aqi = airQuality.european_aqi
  if (aqi === null) return null

  const level = getAqiLevel(aqi)
  const pollen = getPollenReadings(airQuality)

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {t.air_quality}
      </h2>

      <div className={styles.body}>
        <div className={styles.summary}>
          <p className={styles.index}>
            <span className={styles.aqi}>{Math.round(aqi)}</span>
            <span className={styles.level} data-level={level}>
              {t.aqi_levels[level]}
            </span>
          </p>

          <div className={styles.scale} aria-hidden>
            {AQI_LEVELS.map((band) => (
              <span key={band} className={styles.band} data-level={band} />
            ))}
            <span className={styles.marker} style={{ left: `${getAqiScalePosition(aqi)}%` }} />
          </div>
        </div>

        <dl className={styles.pollutants}>
          <div className={styles.pollutant}>
            <dt className={styles.label}>PM2.5</dt>
            <dd className={styles.value}>
              {formatPm(airQuality.pm2_5)} <span className={styles.unit}>{t.pm_unit}</span>
            </dd>
          </div>
          <div className={styles.pollutant}>
            <dt className={styles.label}>PM10</dt>
            <dd className={styles.value}>
              {formatPm(airQuality.pm10)} <span className={styles.unit}>{t.pm_unit}</span>
            </dd>
          </div>
        </dl>
      </div>

      {pollen.length > 0 && (
        <p className={styles.pollen}>
          <span className={styles.pollenLabel}>{t.pollen}:</span>{' '}
          {pollen
            .map(({ type, level }) => `${t.pollen_types[type]} — ${t.pollen_levels[level]}`)
            .join(', ')}
        </p>
      )}
    </section>
  )
}
