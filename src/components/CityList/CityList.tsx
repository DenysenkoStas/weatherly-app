import type { GeoResult } from '../../types'
import styles from './CityList.module.scss'

interface CityListProps {
  results: GeoResult[]
  onSelect: (city: GeoResult) => void
  emptyMessage?: string
  emptyMessageVariant?: 'muted' | 'error'
}

export function CityList({
  results,
  onSelect,
  emptyMessage,
  emptyMessageVariant = 'muted',
}: CityListProps) {
  if (results.length === 0 && !emptyMessage) return null

  return (
    <ul className={styles.list} role="listbox">
      {results.length > 0 ? (
        results.map((city) => (
          <li key={city.id} role="option">
            <button className={styles.item} onClick={() => onSelect(city)}>
              <span className={styles.name}>{city.name}</span>
              <span className={styles.meta}>
                {city.admin1 ? `${city.admin1}, ` : ''}
                {city.country}
              </span>
            </button>
          </li>
        ))
      ) : (
        <li
          className={emptyMessageVariant === 'error' ? styles.emptyError : styles.emptyMuted}
          role="status"
        >
          {emptyMessage}
        </li>
      )}
    </ul>
  )
}
