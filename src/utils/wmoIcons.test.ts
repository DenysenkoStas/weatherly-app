import { describe, expect, it } from 'vitest'
import { getWeatherIcon, wmoIcons } from './wmoIcons'

describe('getWeatherIcon', () => {
  it('uses the day icon by default', () => {
    expect(getWeatherIcon(0)).toBe(wmoIcons[0])
    expect(getWeatherIcon(0, true)).toBe(wmoIcons[0])
  })

  it('uses a night icon for sunny codes at night', () => {
    expect(getWeatherIcon(0, false)).not.toBe(wmoIcons[0])
    expect(getWeatherIcon(2, false)).not.toBe(wmoIcons[2])
  })

  it('keeps the same icon at night when it has no sun', () => {
    expect(getWeatherIcon(3, false)).toBe(wmoIcons[3])
    expect(getWeatherIcon(63, false)).toBe(wmoIcons[63])
  })

  it('falls back for an unknown code', () => {
    expect(getWeatherIcon(42, false)).toBe(getWeatherIcon(42))
  })
})
