import { describe, expect, it } from 'vitest'
import type { AirQualityCurrent } from '../types'
import { getAqiLevel, getAqiScalePosition, getPollenReadings } from './airQuality'

const noPollen: AirQualityCurrent = {
  european_aqi: 27,
  pm2_5: 8.5,
  pm10: 10.3,
  alder_pollen: 0,
  birch_pollen: 0,
  grass_pollen: 0,
  mugwort_pollen: 0,
  olive_pollen: 0,
  ragweed_pollen: 0,
}

describe('getAqiLevel', () => {
  it('maps the European AQI bands', () => {
    expect(getAqiLevel(0)).toBe('good')
    expect(getAqiLevel(20)).toBe('good')
    expect(getAqiLevel(21)).toBe('fair')
    expect(getAqiLevel(55)).toBe('moderate')
    expect(getAqiLevel(80)).toBe('poor')
    expect(getAqiLevel(95)).toBe('very_poor')
    expect(getAqiLevel(240)).toBe('extremely_poor')
  })
})

describe('getAqiScalePosition', () => {
  it('places the marker along a 0–120 scale and clamps it', () => {
    expect(getAqiScalePosition(0)).toBe(0)
    expect(getAqiScalePosition(60)).toBe(50)
    expect(getAqiScalePosition(500)).toBe(100)
    expect(getAqiScalePosition(-5)).toBe(0)
  })
})

describe('getPollenReadings', () => {
  it('returns nothing without pollen or outside Europe', () => {
    expect(getPollenReadings(noPollen)).toEqual([])
    expect(
      getPollenReadings({
        ...noPollen,
        alder_pollen: null,
        birch_pollen: null,
        grass_pollen: null,
        mugwort_pollen: null,
        olive_pollen: null,
        ragweed_pollen: null,
      }),
    ).toEqual([])
  })

  it('rates each type by its own thresholds, strongest first', () => {
    expect(
      getPollenReadings({ ...noPollen, birch_pollen: 40, grass_pollen: 60, alder_pollen: 3 }),
    ).toEqual([
      { type: 'grass', level: 'high' },
      { type: 'birch', level: 'moderate' },
      { type: 'alder', level: 'low' },
    ])
  })
})
