import { describe, expect, it } from 'vitest'
import { getWeatherLabel } from './wmo'
import { en, uk } from '../locales'

describe('getWeatherLabel', () => {
  it('returns the label for a known WMO code', () => {
    expect(getWeatherLabel(3, en.weather, en.weather_unknown)).toBe('Overcast')
    expect(getWeatherLabel(3, uk.weather, uk.weather_unknown)).toBe('Хмарно')
  })

  it('uses the unknown label for a code without a translation', () => {
    expect(getWeatherLabel(42, en.weather, en.weather_unknown)).toBe('Unknown')
    expect(getWeatherLabel(42, uk.weather, uk.weather_unknown)).toBe('Невідомо')
  })

  it('has a translation for every WMO code in both languages', () => {
    const enCodes = Object.keys(en.weather).map(Number)
    const ukCodes = Object.keys(uk.weather).map(Number)

    expect(ukCodes.sort()).toEqual(enCodes.sort())

    for (const code of enCodes) {
      expect(getWeatherLabel(code, en.weather, en.weather_unknown)).toBeTruthy()
      expect(getWeatherLabel(code, uk.weather, uk.weather_unknown)).toBeTruthy()
    }
  })
})
