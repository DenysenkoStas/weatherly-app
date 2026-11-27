import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentHourIndex, getHourlyForDay } from './hourly'
import type { HourlyEntry } from './hourly'
import type { WeatherHourly } from '../types'

function makeDayHours(date: string): HourlyEntry[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    time: `${date}T${String(hour).padStart(2, '0')}:00`,
    temperature: 20,
    feelsLike: 18,
    windSpeed: 3,
    windDirection: 0,
    precipitation: 0,
    weatherCode: 0,
    precipitationProbability: 0,
    isDay: hour >= 7 && hour < 17,
  }))
}

describe('getHourlyForDay', () => {
  const hourly: WeatherHourly = {
    time: ['2026-06-26T23:00', '2026-06-27T00:00', '2026-06-27T01:00', '2026-06-28T00:00'],
    temperature_2m: [18, 17, 16, 15],
    apparent_temperature: [16, 15, 14, 13],
    wind_speed_10m: [3, 4, 5, 6],
    wind_direction_10m: [90, 180, 270, 0],
    precipitation: [0, 0.2, 0, 1.4],
    weather_code: [0, 1, 2, 3],
    precipitation_probability: [0, 10, 20, 30],
    is_day: [0, 0, 0, 1],
  }

  it('returns only entries for the given date', () => {
    const result = getHourlyForDay(hourly, '2026-06-27')

    expect(result).toEqual([
      {
        time: '2026-06-27T00:00',
        temperature: 17,
        feelsLike: 15,
        windSpeed: 4,
        windDirection: 180,
        precipitation: 0.2,
        weatherCode: 1,
        precipitationProbability: 10,
        isDay: false,
      },
      {
        time: '2026-06-27T01:00',
        temperature: 16,
        feelsLike: 14,
        windSpeed: 5,
        windDirection: 270,
        precipitation: 0,
        weatherCode: 2,
        precipitationProbability: 20,
        isDay: false,
      },
    ])
  })

  it('returns an empty array when the date is not in the forecast', () => {
    expect(getHourlyForDay(hourly, '2026-07-01')).toEqual([])
  })

  it('falls back to 0 when precipitation probability is missing', () => {
    const withGap = {
      ...hourly,
      precipitation_probability: [0, null, 20, 30],
    } as unknown as WeatherHourly

    expect(getHourlyForDay(withGap, '2026-06-27')[0].precipitationProbability).toBe(0)
  })
})

describe('getCurrentHourIndex', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 07:30 UTC = 10:30 in Kyiv (UTC+3 in summer) = 03:30 in New York (UTC-4)
    vi.setSystemTime(new Date('2026-06-26T07:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('finds the current hour in the city timezone', () => {
    const hours = makeDayHours('2026-06-26')

    expect(hours[getCurrentHourIndex(hours, 'Europe/Kyiv')].time).toBe('2026-06-26T10:00')
    expect(hours[getCurrentHourIndex(hours, 'America/New_York')].time).toBe('2026-06-26T03:00')
  })

  it('returns 0 for a future day', () => {
    expect(getCurrentHourIndex(makeDayHours('2026-06-27'), 'Europe/Kyiv')).toBe(0)
  })

  it('returns the last index for a past day', () => {
    expect(getCurrentHourIndex(makeDayHours('2026-06-25'), 'Europe/Kyiv')).toBe(23)
  })

  it('returns 0 for an empty list', () => {
    expect(getCurrentHourIndex([], 'Europe/Kyiv')).toBe(0)
  })
})
