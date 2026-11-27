import { describe, expect, it } from 'vitest'
import type { WeatherMinutely15 } from '../types'
import { getNowcast } from './nowcast'

const TIMES = [
  '2026-11-27T21:45',
  '2026-11-27T22:00',
  '2026-11-27T22:15',
  '2026-11-27T22:30',
  '2026-11-27T22:45',
]

function minutely(
  precipitation: (number | null)[],
  snowfall: (number | null)[] = precipitation.map(() => 0),
): WeatherMinutely15 {
  return { time: TIMES.slice(0, precipitation.length), precipitation, snowfall }
}

describe('getNowcast', () => {
  it('returns null without data or when it stays dry', () => {
    expect(getNowcast(null)).toBeNull()
    expect(getNowcast(undefined)).toBeNull()
    expect(getNowcast(minutely([]))).toBeNull()
    expect(getNowcast(minutely([0, 0, null, 0]))).toBeNull()
  })

  it('tells when rain starts: a step before its first wet value', () => {
    expect(getNowcast(minutely([0, 0, 0, 0.3, 0.1]))).toEqual({
      kind: 'start',
      type: 'rain',
      time: '22:15',
    })
  })

  it('tells when rain stops', () => {
    expect(getNowcast(minutely([0.4, 0.2, 0, 0.5]))).toEqual({
      kind: 'stop',
      type: 'rain',
      time: '22:00',
    })
  })

  it('reports rain that lasts the whole time', () => {
    expect(getNowcast(minutely([0.4, 0.2, 0.1]))).toEqual({ kind: 'ongoing', type: 'rain' })
  })

  it('tells snow from rain by the share of water that fell as snow', () => {
    expect(getNowcast(minutely([0, 0.2, 0.2], [0, 0.14, 0.07]))).toEqual({
      kind: 'start',
      type: 'snow',
      time: '21:45',
    })
    expect(getNowcast(minutely([0.2, 0.2, 0], [0.14, 0, 0]))).toEqual({
      kind: 'stop',
      type: 'mixed',
      time: '22:00',
    })
  })

  it('wraps around midnight', () => {
    const data: WeatherMinutely15 = {
      time: ['2026-11-27T23:45', '2026-11-28T00:00'],
      precipitation: [0, 0.1],
      snowfall: [0, 0],
    }
    expect(getNowcast(data)).toEqual({ kind: 'start', type: 'rain', time: '23:45' })
  })
})
