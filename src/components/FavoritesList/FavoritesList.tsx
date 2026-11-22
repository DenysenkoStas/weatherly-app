import { useEffect, useRef, useState } from 'react'
import type { FavoriteCity } from '../../types'
import styles from './FavoritesList.module.scss'

interface FavoritesListProps {
  favorites: FavoriteCity[]
  activeId?: string | null
  onSelect: (city: FavoriteCity) => void
}

interface Overflow {
  start: boolean
  end: boolean
}

export function FavoritesList({ favorites, activeId, onSelect }: FavoritesListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState<Overflow>({ start: false, end: false })

  // On desktop the chips sit in one scrollable row in the header:
  // track which edges have hidden chips (for the fade) and let the mouse wheel scroll sideways.
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const update = () => {
      const maxScroll = list.scrollWidth - list.clientWidth
      const start = list.scrollLeft > 1
      const end = list.scrollLeft < maxScroll - 1
      setOverflow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }

    const handleWheel = (event: WheelEvent) => {
      if (list.scrollWidth <= list.clientWidth) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      // A vertical wheel turn scrolls the row sideways
      const step = event.deltaY
      list.scrollLeft += step
    }

    // ResizeObserver also fires once right after observe(), which sets the initial fade
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(list)
    list.addEventListener('scroll', update, { passive: true })
    list.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      observer?.disconnect()
      list.removeEventListener('scroll', update)
      list.removeEventListener('wheel', handleWheel)
    }
  }, [favorites.length])

  if (favorites.length === 0) return null

  return (
    <div
      ref={listRef}
      className={styles.list}
      data-fade-start={overflow.start || undefined}
      data-fade-end={overflow.end || undefined}
    >
      {favorites.map((city) => {
        const isActive = city.id === activeId
        return (
          <button
            key={city.id}
            type="button"
            className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`}
            aria-current={isActive || undefined}
            onClick={() => onSelect(city)}
          >
            ★ {city.name}
          </button>
        )
      })}
    </div>
  )
}
