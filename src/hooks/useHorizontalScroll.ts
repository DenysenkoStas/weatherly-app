import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** Which edges of a sideways-scrolling row have hidden items */
export interface EdgeOverflow {
  start: boolean
  end: boolean
}

/**
 * For a row that scrolls sideways: tracks which edges have hidden items (for the fade, see the
 * `edge-fade` mixin) and lets a vertical mouse wheel scroll the row.
 * `itemCount` re-runs the setup when the items change (the row may appear only with items).
 */
export function useHorizontalScroll(
  ref: RefObject<HTMLElement | null>,
  itemCount: number,
): EdgeOverflow {
  const [overflow, setOverflow] = useState<EdgeOverflow>({ start: false, end: false })

  useEffect(() => {
    const row = ref.current
    if (!row) return

    const update = () => {
      const maxScroll = row.scrollWidth - row.clientWidth
      const start = row.scrollLeft > 1
      const end = row.scrollLeft < maxScroll - 1
      setOverflow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }

    const handleWheel = (event: WheelEvent) => {
      if (row.scrollWidth <= row.clientWidth) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      event.preventDefault()
      // A vertical wheel turn scrolls the row sideways (a named step also keeps the IDE from
      // flagging deltaY → scrollLeft as a mix-up)
      const step = event.deltaY
      row.scrollLeft += step
    }

    // ResizeObserver also fires once right after observe(), which sets the initial fade
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(row)
    row.addEventListener('scroll', update, { passive: true })
    row.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      observer?.disconnect()
      row.removeEventListener('scroll', update)
      row.removeEventListener('wheel', handleWheel)
    }
  }, [ref, itemCount])

  return overflow
}
