import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { FavoriteCity } from '../../types'
import { moveItem } from '../../utils'
import { useDragReorder } from './useDragReorder'
import styles from './FavoritesList.module.scss'

interface FavoritesListProps {
  favorites: FavoriteCity[]
  activeId?: string | null
  onSelect: (city: FavoriteCity) => void
  onRemove: (city: FavoriteCity) => void
  onReorder: (ids: string[]) => void
  t: { remove_favorite: string; reorder_hint: string }
}

interface Overflow {
  start: boolean
  end: boolean
}

export function FavoritesList({
  favorites,
  activeId,
  onSelect,
  onRemove,
  onReorder,
  t,
}: FavoritesListProps) {
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
    // The chip's DOM node moves, which drops the focus: put it back
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-reorder-id="${id}"] [data-role="select"]`)
        ?.focus()
    })
  }

  if (favorites.length === 0) return null

  return (
    <div
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
          <div
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
              onClick={() => {
                if (!consumeDragClick()) onSelect(city)
              }}
              onKeyDown={(event) => handleKeyDown(event, city.id)}
            >
              {city.name}
            </button>
          </div>
        )
      })}
    </div>
  )
}
