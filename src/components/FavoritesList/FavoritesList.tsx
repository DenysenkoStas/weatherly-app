import { useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { FavoriteCity } from '../../types'
import { moveItem } from '../../utils'
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll'
import { useDragReorder } from './useDragReorder'
import styles from './FavoritesList.module.scss'

interface FavoritesListProps {
  favorites: FavoriteCity[]
  activeId?: string | null
  onSelect: (city: FavoriteCity) => void
  onRemove: (city: FavoriteCity) => void
  onReorder: (ids: string[]) => void
  t: {
    favorites: string
    favorite_position: string
    remove_favorite: string
    reorder_hint: string
  }
}

export function FavoritesList({
  favorites,
  activeId,
  onSelect,
  onRemove,
  onReorder,
  t,
}: FavoritesListProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const hintId = useId()
  // A keyboard move is read out by screen readers: the chip keeps focus, so nothing else is
  const [announcement, setAnnouncement] = useState('')

  // On desktop the chips sit in one scrollable row in the header
  const overflow = useHorizontalScroll(listRef, favorites.length)

  const ids = useMemo(() => favorites.map((city) => city.id), [favorites])
  const byId = useMemo(() => new Map(favorites.map((city) => [city.id, city])), [favorites])
  const { order, draggingId, handlePointerDown, consumeDragClick } = useDragReorder(ids, onReorder)

  // Alt + ←/→ moves the focused chip, for keyboard users
  const handleKeyDown = (event: KeyboardEvent, id: string) => {
    if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return
    event.preventDefault()
    const from = ids.indexOf(id)
    const to = from + (event.key === 'ArrowLeft' ? -1 : 1)
    if (to < 0 || to >= ids.length) return
    onReorder(moveItem(ids, from, to))
    setAnnouncement(
      t.favorite_position
        .replace('{city}', byId.get(id)?.name ?? '')
        .replace('{n}', String(to + 1))
        .replace('{total}', String(ids.length)),
    )
    // The chip's DOM node moves, which drops the focus: put it back
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-reorder-id="${id}"] [data-role="select"]`)
        ?.focus()
    })
  }

  if (favorites.length === 0) return null

  return (
    <nav aria-label={t.favorites}>
      <ul
        ref={listRef}
        className={styles.list}
        data-fade-start={overflow.start || undefined}
        data-fade-end={overflow.end || undefined}
        data-dragging={draggingId ? true : undefined}
      >
        {order.map((id) => {
          const city = byId.get(id)
          if (!city) return null
          const isActive = city.id === activeId
          const isDragging = city.id === draggingId
          const removeLabel = `${t.remove_favorite}: ${city.name}`
          return (
            <li
              key={city.id}
              className={[
                styles.item,
                isActive && styles.itemActive,
                isDragging && styles.itemDragging,
              ]
                .filter(Boolean)
                .join(' ')}
              data-reorder-id={city.id}
              onPointerDown={(event) => handlePointerDown(event, city.id)}
            >
              {/* The star turns into × while the chip is hovered (always × on touch screens) */}
              <button
                type="button"
                className={styles.remove}
                onClick={() => {
                  if (!consumeDragClick()) onRemove(city)
                }}
                aria-label={removeLabel}
                title={removeLabel}
              >
                <span className={styles.star} aria-hidden>
                  ★
                </span>
                <span className={styles.cross} aria-hidden>
                  ×
                </span>
              </button>
              <button
                type="button"
                className={styles.select}
                data-role="select"
                aria-current={isActive || undefined}
                aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                title={t.reorder_hint}
                aria-describedby={hintId}
                onClick={() => {
                  if (!consumeDragClick()) onSelect(city)
                }}
                onKeyDown={(event) => handleKeyDown(event, city.id)}
              >
                {city.name}
              </button>
            </li>
          )
        })}
      </ul>
      {/* The tooltip only shows on hover, screen readers read the hint with each chip */}
      <p id={hintId} className={styles.visuallyHidden}>
        {t.reorder_hint}
      </p>
      <p className={styles.visuallyHidden} role="status">
        {announcement}
      </p>
    </nav>
  )
}
