import { describe, expect, it } from 'vitest'
import { getWeatherLabel } from './wmo'
import { en, uk } from '../locales'

describe('getWeatherLabel', () => {
  it('returns the label for a known WMO code', () => {
    expect(getWeatherLabel(3, en.weather)).toBe('Overcast')
    expect(getWeatherLabel(3, uk.weather)).toBe('Хмарно')
  })

  it('falls back to code 0 for an unknown code', () => {
    expect(getWeatherLabel(42, en.weather)).toBe(en.weather[0])
    expect(getWeatherLabel(42, uk.weather)).toBe(uk.weather[0])
  })

  it('has a translation for every WMO code in both languages', () => {
    const enCodes = Object.keys(en.weather).map(Number)
    const ukCodes = Object.keys(uk.weather).map(Number)

    expect(ukCodes.sort()).toEqual(enCodes.sort())

    for (const code of enCodes) {
      expect(getWeatherLabel(code, en.weather)).toBeTruthy()
      expect(getWeatherLabel(code, uk.weather)).toBeTruthy()
    }
  })
})
