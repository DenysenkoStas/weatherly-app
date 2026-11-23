import { useCallback, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { moveItem } from '../../utils'

// The pointer has to travel this far before a press becomes a drag (a shorter move is still a click)
const DRAG_THRESHOLD = 6
// On touch screens a drag starts after a long press, so a swipe still scrolls the page
const LONG_PRESS_MS = 350

interface Press {
  id: string
  pointerId: number
  x: number
  y: number
  isTouch: boolean
  timer: number | null
}

interface DragState {
  id: string
  order: string[]
}

/**
 * Reordering chips with a pointer: the dragged chip swaps places with the chip under the pointer
 * once the pointer crosses that chip's middle. Chips carry their id in `data-reorder-id`.
 */
export function useDragReorder(ids: string[], onReorder: (ids: string[]) => void) {
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const pressRef = useRef<Press | null>(null)
  // A drag ends with pointerup over a chip: the click that follows must not open the city
  const suppressClickRef = useRef(false)

  const updateDrag = (next: DragState | null) => {
    dragRef.current = next
    setDrag(next)
  }

  const preventTouchScroll = useCallback((event: TouchEvent) => {
    if (dragRef.current) event.preventDefault()
  }, [])

  const startDrag = useCallback(
    (id: string) => {
      updateDrag({ id, order: ids })
      window.addEventListener('touchmove', preventTouchScroll, { passive: false })
    },
    [ids, preventTouchScroll],
  )

  const moveDrag = (x: number, y: number) => {
    const current = dragRef.current
    if (!current) return

    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-reorder-id]')
    const targetId = target?.dataset.reorderId
    if (!target || !targetId || targetId === current.id) return

    const from = current.order.indexOf(current.id)
    const to = current.order.indexOf(targetId)
    if (from === -1 || to === -1) return

    // Swap only past the middle of the target, so chips of different widths don't flip back and forth
    const rect = target.getBoundingClientRect()
    const middle = rect.left + rect.width / 2
    const sameRow = y >= rect.top && y <= rect.bottom
    if (sameRow && ((to > from && x < middle) || (to < from && x > middle))) return

    updateDrag({ ...current, order: moveItem(current.order, from, to) })
  }

  const endPress = useCallback(
    (commit: boolean) => {
      const press = pressRef.current
      if (press?.timer) window.clearTimeout(press.timer)
      pressRef.current = null
      window.removeEventListener('touchmove', preventTouchScroll)

      const current = dragRef.current
      if (!current) return
      updateDrag(null)
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      })
      if (commit && current.order.some((id, i) => id !== ids[i])) onReorder(current.order)
    },
    [ids, onReorder, preventTouchScroll],
  )

  const handlePointerDown = (event: ReactPointerEvent, id: string) => {
    if (event.button !== 0 || pressRef.current) return

    const isTouch = event.pointerType === 'touch'
    const press: Press = {
      id,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      isTouch,
      timer: isTouch ? window.setTimeout(() => startDrag(id), LONG_PRESS_MS) : null,
    }
    pressRef.current = press

    const handleMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== press.pointerId) return
      if (dragRef.current) {
        moveDrag(moveEvent.clientX, moveEvent.clientY)
        return
      }
      const moved = Math.hypot(moveEvent.clientX - press.x, moveEvent.clientY - press.y)
      if (moved < DRAG_THRESHOLD) return
      // A touch that moves before the long press is a scroll, not a drag
      if (press.isTouch) {
        finish(false)
        return
      }
      startDrag(press.id)
      moveDrag(moveEvent.clientX, moveEvent.clientY)
    }
    const handleUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId === press.pointerId) finish(true)
    }
    const handleCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId === press.pointerId) finish(false)
    }
    const finish = (commit: boolean) => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleCancel)
      endPress(commit)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleCancel)
  }

  /** Call from the chip's click handler: true right after a drag */
  const consumeDragClick = () => suppressClickRef.current

  return {
    order: drag?.order ?? ids,
    draggingId: drag?.id ?? null,
    handlePointerDown,
    consumeDragClick,
  }
}
