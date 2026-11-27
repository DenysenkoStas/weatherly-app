import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { loadMotion, useMotion } from './useMotion'

describe('loadMotion', () => {
  it('defaults to auto and ignores unknown values', () => {
    expect(loadMotion()).toBe('auto')

    localStorage.setItem('weatherly-motion', 'fast')
    expect(loadMotion()).toBe('auto')

    localStorage.setItem('weatherly-motion', 'off')
    expect(loadMotion()).toBe('off')
  })
})

describe('useMotion', () => {
  it('changes, remembers and exposes the setting to CSS', () => {
    const { result } = renderHook(() => useMotion())
    expect(document.documentElement.dataset.motion).toBe('auto')

    act(() => result.current.setMotion('off'))

    expect(result.current.motion).toBe('off')
    expect(localStorage.getItem('weatherly-motion')).toBe('off')
    expect(document.documentElement.dataset.motion).toBe('off')
  })
})
