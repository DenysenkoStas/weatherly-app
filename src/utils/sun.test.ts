import { describe, expect, it } from 'vitest'
import { formatDuration, getCompassIndex, getDaylightProgress, getUvLevel } from './sun'
import { en, uk } from '../locales'

describe('getDaylightProgress', () => {
  const sunrise = '2026-11-21T07:00'
  const sunset = '2026-11-21T16:00'

  it('returns the share of daylight that has passed', () => {
    expect(getDaylightProgress(sunrise, sunset, '2026-11-21T07:00')).toBe(0)
    expect(getDaylightProgress(sunrise, sunset, '2026-11-21T11:30')).toBe(0.5)
    expect(getDaylightProgress(sunrise, sunset, '2026-11-21T16:00')).toBe(1)
  })

  it('returns null at night', () => {
    expect(getDaylightProgress(sunrise, sunset, '2026-11-21T06:59')).toBeNull()
    expect(getDaylightProgress(sunrise, sunset, '2026-11-21T17:15')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formats seconds as hours and minutes', () => {
    expect(formatDuration(31812.13, en)).toBe('8 h 50 min')
    expect(formatDuration(31812.13, uk)).toBe('8 год 50 хв')
  })
})

describe('getUvLevel', () => {
  it('maps the index to WHO categories', () => {
    expect(getUvLevel(0)).toBe('low')
    expect(getUvLevel(2.4)).toBe('low')
    expect(getUvLevel(2.6)).toBe('moderate')
    expect(getUvLevel(6)).toBe('high')
    expect(getUvLevel(8)).toBe('very_high')
    expect(getUvLevel(11)).toBe('extreme')
  })
})

describe('getCompassIndex', () => {
  it('maps degrees to 8 compass points', () => {
    expect(getCompassIndex(0)).toBe(0)
    expect(getCompassIndex(22)).toBe(0)
    expect(getCompassIndex(23)).toBe(1)
    expect(getCompassIndex(189)).toBe(4)
    expect(getCompassIndex(350)).toBe(0)
    expect(getCompassIndex(-90)).toBe(6)
  })

  it('has a label for every point in both languages', () => {
    expect(en.directions).toHaveLength(8)
    expect(uk.directions).toHaveLength(8)
  })
})
