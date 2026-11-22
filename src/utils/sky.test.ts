import { describe, expect, it } from 'vitest'
import { getSky } from './sky'

describe('getSky', () => {
  it('separates clear day and night', () => {
    expect(getSky(0, true)).toBe('clear-day')
    expect(getSky(1, false)).toBe('clear-night')
  })

  it('groups the other codes regardless of time of day', () => {
    expect(getSky(3, false)).toBe('cloudy')
    expect(getSky(48, true)).toBe('fog')
    expect(getSky(55, true)).toBe('rain')
    expect(getSky(81, false)).toBe('rain')
    expect(getSky(73, true)).toBe('snow')
    expect(getSky(86, true)).toBe('snow')
    expect(getSky(96, false)).toBe('storm')
  })

  it('falls back to cloudy for an unknown code', () => {
    expect(getSky(42, true)).toBe('cloudy')
  })
})
