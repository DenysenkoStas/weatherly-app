import { describe, expect, it } from 'vitest'
import { getMoonPhase } from './moon'

describe('getMoonPhase', () => {
  it('finds known new and full moons', () => {
    // UTC times: new moon 2026-11-09 07:02, full moon 2026-11-24 14:55 (almanac.com, USNO)
    const newMoon = getMoonPhase(new Date(Date.UTC(2026, 10, 9, 7, 2)))
    expect(newMoon.phase).toBe('new')
    expect(newMoon.illumination).toBeLessThan(0.02)

    const fullMoon = getMoonPhase(new Date(Date.UTC(2026, 10, 24, 14, 55)))
    expect(fullMoon.phase).toBe('full')
    expect(fullMoon.illumination).toBeGreaterThan(0.98)
  })

  it('tells waxing from waning', () => {
    // First quarter 2026-11-17 11:48, last quarter 2026-12-30 18:59 UTC
    expect(getMoonPhase(new Date(Date.UTC(2026, 10, 17, 11, 48))).phase).toBe('first_quarter')
    expect(getMoonPhase(new Date(Date.UTC(2026, 11, 30, 18, 59))).phase).toBe('last_quarter')
    expect(getMoonPhase(new Date(Date.UTC(2026, 10, 13))).phase).toBe('waxing_crescent')
    expect(getMoonPhase(new Date(Date.UTC(2026, 10, 28))).phase).toBe('waning_gibbous')
  })

  it('works for dates before the reference new moon', () => {
    const { illumination } = getMoonPhase(new Date(Date.UTC(1999, 0, 1)))
    expect(illumination).toBeGreaterThanOrEqual(0)
    expect(illumination).toBeLessThanOrEqual(1)
  })
})
