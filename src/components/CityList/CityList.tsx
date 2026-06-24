import type { GeoResult } from '../../types'
import styles from './CityList.module.scss'

interface CityListProps {
  listboxId: string
  results: GeoResult[]
  activeIndex: number
  onSelect: (city: GeoResult) => void
  onHighlight: (index: number) => void
  emptyMessage?: string
  emptyMessageVariant?: 'muted' | 'error'
}

export type { CityListProps }

export function CityList({
  listboxId,
  results,
  activeIndex,
  onSelect,
  onHighlight,
  emptyMessage,
  emptyMessageVariant = 'muted',
}: CityListProps) {
  if (results.length === 0 && !emptyMessage) return null

  if (results.length === 0 && emptyMessage) {
    return (
      <div className={styles.list} role="status" aria-live="polite">
        <p className={emptyMessageVariant === 'error' ? styles.emptyError : styles.emptyMuted}>
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <ul id={listboxId} className={styles.list} role="listbox">
      {results.map((city, index) => (
        <li
          key={city.id}
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={index === activeIndex}
          className={`${styles.item}${index === activeIndex ? ` ${styles.itemActive}` : ''}`}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => onHighlight(index)}
          onClick={() => onSelect(city)}
        >
          <span className={styles.name}>{city.name}</span>
          <span className={styles.meta}>
            {city.admin1 ? `${city.admin1}, ` : ''}
            {city.country}
          </span>
        </li>
      ))}
    </ul>
  )
}
