import partlyCloudyDay from '@meteocons/svg/fill/partly-cloudy-day.svg?url'
import { makeFavoriteId } from '../../hooks/useFavorites'
import type { FavoriteCity, Translations } from '../../types'
import styles from './EmptyState.module.scss'

const POPULAR_CITIES = [
  { key: 'kyiv', latitude: 50.45, longitude: 30.52 },
  { key: 'lviv', latitude: 49.84, longitude: 24.03 },
  { key: 'odesa', latitude: 46.48, longitude: 30.73 },
  { key: 'kharkiv', latitude: 49.99, longitude: 36.23 },
] as const

interface EmptyStateProps {
  canLocate: boolean
  locationDenied: boolean
  onLocate: () => void
  onSelectCity: (city: FavoriteCity) => void
  t: Translations
}

export function EmptyState({
  canLocate,
  locationDenied,
  onLocate,
  onSelectCity,
  t,
}: EmptyStateProps) {
  return (
    <section className={styles.card} aria-labelledby="empty-state-title">
      <img className={styles.icon} src={partlyCloudyDay} alt="" width={112} height={112} />
      <h2 id="empty-state-title" className={styles.title}>
        {t.empty_title}
      </h2>
      <p className={styles.text}>{t.empty_state}</p>

      {canLocate && !locationDenied && (
        <button type="button" className={styles.locateButton} onClick={onLocate}>
          <svg
            className={styles.locateIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
          </svg>
          {t.locate_me}
        </button>
      )}

      {locationDenied && <p className={styles.note}>{t.errors.geolocation_denied}</p>}

      <div className={styles.popular}>
        <h3 className={styles.popularTitle}>{t.popular_cities}</h3>
        <div className={styles.chips}>
          {POPULAR_CITIES.map(({ key, latitude, longitude }) => {
            const name = t.cities[key]
            return (
              <button
                key={key}
                type="button"
                className={styles.chip}
                onClick={() =>
                  onSelectCity({
                    id: makeFavoriteId(latitude, longitude),
                    name,
                    latitude,
                    longitude,
                  })
                }
              >
                {name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
