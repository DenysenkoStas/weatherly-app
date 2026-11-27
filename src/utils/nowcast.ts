import type { WeatherMinutely15 } from '../types'

export type PrecipitationType = 'rain' | 'snow' | 'mixed'
export type NowcastKind = 'start' | 'stop' | 'ongoing'

export type Nowcast =
  /** Dry now and starts at `time`, or falling now and stops at `time` (local time of the city) */
  | { kind: 'start' | 'stop'; type: PrecipitationType; time: string }
  /** Falls the whole time ahead */
  | { kind: 'ongoing'; type: PrecipitationType }

// Open-Meteo counts fresh snow as 0.7 cm per mm of water
const SNOW_CM_PER_MM = 0.7
const STEP_MINUTES = 15

function isWet(minutely: WeatherMinutely15, index: number): boolean {
  return (minutely.precipitation[index] ?? 0) > 0
}

// A step is snow when at least half of its water fell as snow
function isSnow(minutely: WeatherMinutely15, index: number): boolean {
  const water = minutely.precipitation[index] ?? 0
  const snowWater = (minutely.snowfall[index] ?? 0) / SNOW_CM_PER_MM
  return snowWater * 2 >= water
}

function getType(minutely: WeatherMinutely15, from: number, to: number): PrecipitationType {
  const snowSteps = Array.from({ length: to - from }, (_, i) => isSnow(minutely, from + i))
  if (snowSteps.every(Boolean)) return 'snow'
  return snowSteps.some(Boolean) ? 'mixed' : 'rain'
}

// A value is the sum of the 15 minutes before its time, so the change happens a step earlier:
// "2026-11-27T22:45" → "22:30"
function getStepStart(time: string): string {
  const minutes = Number(time.slice(11, 13)) * 60 + Number(time.slice(14, 16))
  const start = (minutes - STEP_MINUTES + 24 * 60) % (24 * 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(start / 60))}:${pad(start % 60)}`
}

/**
 * When rain or snow starts or stops, from 15-minute data that begins with the current step.
 * Null when it stays dry the whole time.
 */
export function getNowcast(minutely: WeatherMinutely15 | null | undefined): Nowcast | null {
  const steps = minutely?.time.length ?? 0
  if (!minutely || steps === 0) return null

  const wetNow = isWet(minutely, 0)
  // The first step that differs from now
  let change = 1
  while (change < steps && isWet(minutely, change) === wetNow) change++

  if (wetNow) {
    const type = getType(minutely, 0, change)
    if (change === steps) return { kind: 'ongoing', type }
    return { kind: 'stop', type, time: getStepStart(minutely.time[change]) }
  }

  if (change === steps) return null
  let end = change
  while (end < steps && isWet(minutely, end)) end++
  return {
    kind: 'start',
    type: getType(minutely, change, end),
    time: getStepStart(minutely.time[change]),
  }
}
