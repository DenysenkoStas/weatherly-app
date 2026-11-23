import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { STALE_AFTER_MS, useRefreshWhenStale } from './useRefreshWhenStale'

function comeBack() {
  document.dispatchEvent(new Event('visibilitychange'))
  window.dispatchEvent(new Event('focus'))
}

describe('useRefreshWhenStale', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-23T12:00:00Z'))
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does nothing while the data is fresh', () => {
    const refresh = vi.fn()
    renderHook(() => useRefreshWhenStale(new Date(), refresh))

    vi.advanceTimersByTime(STALE_AFTER_MS - 1000)
    comeBack()

    expect(refresh).not.toHaveBeenCalled()
  })

  it('refreshes once when coming back to stale data', () => {
    const refresh = vi.fn()
    renderHook(() => useRefreshWhenStale(new Date(), refresh))

    vi.advanceTimersByTime(STALE_AFTER_MS + 1000)
    comeBack()

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('does nothing without data', () => {
    const refresh = vi.fn()
    renderHook(() => useRefreshWhenStale(null, refresh))

    vi.advanceTimersByTime(STALE_AFTER_MS + 1000)
    comeBack()

    expect(refresh).not.toHaveBeenCalled()
  })
})
