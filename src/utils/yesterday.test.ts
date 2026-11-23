import { describe, expect, it } from 'vitest'
import type { WeatherResponse } from '../types'
import { compareWithYesterday, splitPastDay } from './yesterday'

function hours(date: string, temps: number[]) {
  return temps.map((_, i) => `${date}T${String(i).padStart(2, '0')}:00`)
}

const yesterdayTemps = Array.from({ length: 24 }, (_, i) => i)
const todayTemps = Array.from({ length: 24 }, (_, i) => 100 + i)

const response = {
  timezone: 'Europe/Kyiv',
  current: { time: '2026-11-23T17:30', temperature_2m: 2.4 },
  daily: {
    time: ['2026-11-22', '2026-11-23'],
    weather_code: [1, 2],
    temperature_2m_max: [7, 3],
    temperature_2m_min: [1, 0],
    sunrise: ['a', 'b'],
    sunset: ['c', 'd'],
    daylight_duration: [10, 20],
    precipitation_probability_max: [5, null],
  },
  hourly: {
    time: [...hours('2026-11-22', yesterdayTemps), ...hours('2026-11-23', todayTemps)],
    temperature_2m: [...yesterdayTemps, ...todayTemps],
    weather_code: [...yesterdayTemps, ...todayTemps],
    precipitation_probability: [...yesterdayTemps, ...todayTemps],
    is_day: [...yesterdayTemps, ...todayTemps],
  },
} as unknown as WeatherResponse

describe('splitPastDay', () => {
  it('moves yesterday out of the forecast', () => {
    const { data, yesterday } = splitPastDay(response)

    expect(data.daily.time).toEqual(['2026-11-23'])
    expect(data.daily.precipitation_probability_max).toEqual([null])
    expect(data.hourly.time[0]).toBe('2026-11-23T00:00')
    expect(data.hourly.temperature_2m).toHaveLength(24)
    expect(yesterday?.time).toHaveLength(24)
    expect(yesterday?.temperature_2m[17]).toBe(17)
  })

  it('leaves a response without a past day unchanged', () => {
    const { data } = splitPastDay(response)
    const again = splitPastDay(data)

    expect(again.data).toBe(data)
    expect(again.yesterday).toBeNull()
  })
})

describe('compareWithYesterday', () => {
  const { yesterday } = splitPastDay(response)

  it('compares with the same hour yesterday, rounded like the screen', () => {
    expect(compareWithYesterday('2026-11-23T17:30', 2.4, yesterday)).toEqual({
      difference: -15,
      yesterdayTemperature: 17,
      hour: '17:00',
    })
    expect(compareWithYesterday('2026-11-23T05:00', 5.4, yesterday)?.difference).toBe(0)
  })

  it('returns null without yesterday data', () => {
    expect(compareWithYesterday('2026-11-23T17:30', 2, null)).toBeNull()
  })
})
