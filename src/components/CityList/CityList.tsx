import type { GeoResult } from '../../types'
import styles from './CityList.module.scss'

interface CityListProps {
  results: GeoResult[]
  onSelect: (city: GeoResult) => void
}

export function CityList({ results, onSelect }: CityListProps) {
  if (results.length === 0) return null

  return (
    <ul className={styles.list}>
      {results.map((city) => (
        <li key={city.id}>
          <button className={styles.item} onClick={() => onSelect(city)}>
            <span className={styles.name}>{city.name}</span>
            <span className={styles.meta}>
              {city.admin1 ? `${city.admin1}, ` : ''}
              {city.country}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
