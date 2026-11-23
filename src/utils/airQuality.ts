import type { AirQualityCurrent } from '../types'

export type AqiLevel = 'good' | 'fair' | 'moderate' | 'poor' | 'very_poor' | 'extremely_poor'

// European AQI bands (EEA): 0–20 good … 100+ extremely poor
export const AQI_LEVELS: readonly AqiLevel[] = [
  'good',
  'fair',
  'moderate',
  'poor',
  'very_poor',
  'extremely_poor',
]
const AQI_BAND = 20
const AQI_SCALE_MAX = AQI_BAND * AQI_LEVELS.length

export function getAqiLevel(aqi: number): AqiLevel {
  const index = Math.min(Math.max(Math.ceil(aqi / AQI_BAND) - 1, 0), AQI_LEVELS.length - 1)
  return AQI_LEVELS[index]
}

/** Marker position on the scale, 0–100 % */
export function getAqiScalePosition(aqi: number): number {
  return (Math.min(Math.max(aqi, 0), AQI_SCALE_MAX) / AQI_SCALE_MAX) * 100
}

export type PollenType = 'alder' | 'birch' | 'grass' | 'mugwort' | 'olive' | 'ragweed'
export type PollenLevel = 'low' | 'moderate' | 'high'

export interface PollenReading {
  type: PollenType
  level: PollenLevel
}

// Grains/m³ where a type becomes moderate and high. Rough values: allergenic strength differs a lot,
// so grass and ragweed matter at far lower counts than tree pollen.
const POLLEN_THRESHOLDS: Record<PollenType, readonly [moderate: number, high: number]> = {
  alder: [10, 100],
  birch: [10, 100],
  grass: [5, 50],
  mugwort: [5, 30],
  olive: [50, 200],
  ragweed: [5, 20],
}

const POLLEN_LEVEL_ORDER: Record<PollenLevel, number> = { low: 0, moderate: 1, high: 2 }

/** Pollen types present in the air, strongest first */
export function getPollenReadings(current: AirQualityCurrent): PollenReading[] {
  const readings: (PollenReading & { value: number })[] = []

  for (const type of Object.keys(POLLEN_THRESHOLDS) as PollenType[]) {
    const value = current[`${type}_pollen`]
    if (value === null || value <= 0) continue

    const [moderate, high] = POLLEN_THRESHOLDS[type]
    const level: PollenLevel = value >= high ? 'high' : value >= moderate ? 'moderate' : 'low'
    readings.push({ type, level, value })
  }

  return readings
    .sort((a, b) => POLLEN_LEVEL_ORDER[b.level] - POLLEN_LEVEL_ORDER[a.level] || b.value - a.value)
    .map(({ type, level }) => ({ type, level }))
}
