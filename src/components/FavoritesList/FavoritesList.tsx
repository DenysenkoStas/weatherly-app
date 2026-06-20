import type { FavoriteCity } from '../../types'
import styles from './FavoritesList.module.scss'

interface FavoritesListProps {
  favorites: FavoriteCity[]
  onSelect: (city: FavoriteCity) => void
}

export function FavoritesList({ favorites, onSelect }: FavoritesListProps) {
  if (favorites.length === 0) return null

  return (
    <div className={styles.list}>
      {favorites.map((city) => (
        <button key={city.id} className={styles.item} onClick={() => onSelect(city)}>
          ★ {city.name}
        </button>
      ))}
    </div>
  )
}
