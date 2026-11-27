import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { getClock, useTimeFormat } from './useTimeFormat'

describe('getClock', () => {
  it('follows the app language on auto', () => {
    expect(getClock('auto', 'en')).toEqual({ locale: 'en', hour12: true })
    expect(getClock('auto', 'uk')).toEqual({ locale: 'uk', hour12: false })
  })

  it('keeps the chosen clock in any language', () => {
    expect(getClock('24h', 'en').hour12).toBe(false)
    expect(getClock('12h', 'uk').hour12).toBe(true)
  })
})

describe('useTimeFormat', () => {
  it('remembers the choice', () => {
    const { result } = renderHook(() => useTimeFormat())
    expect(result.current.timeFormat).toBe('auto')

    act(() => result.current.setTimeFormat('12h'))

    expect(localStorage.getItem('weatherly-time-format')).toBe('12h')
    expect(renderHook(() => useTimeFormat()).result.current.timeFormat).toBe('12h')
  })
})
