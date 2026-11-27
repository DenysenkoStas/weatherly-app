import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLatestRequest } from './useLatestRequest'

describe('useLatestRequest', () => {
  it('aborts the previous request when a new one starts', () => {
    const { result } = renderHook(() => useLatestRequest())

    const first = result.current.start()
    const second = result.current.start()

    expect(first.aborted).toBe(true)
    expect(second.aborted).toBe(false)
  })

  it('abort drops the current request', () => {
    const { result } = renderHook(() => useLatestRequest())

    const signal = result.current.start()
    result.current.abort()

    expect(signal.aborted).toBe(true)
  })

  it('aborts the running request on unmount', () => {
    const { result, unmount } = renderHook(() => useLatestRequest())

    const signal = result.current.start()
    unmount()

    expect(signal.aborted).toBe(true)
  })
})
