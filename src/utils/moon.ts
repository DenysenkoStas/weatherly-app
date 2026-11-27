export type MoonPhase =
  | 'new'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'

const PHASES: MoonPhase[] = [
  'new',
  'waxing_crescent',
  'first_quarter',
  'waxing_gibbous',
  'full',
  'waning_gibbous',
  'last_quarter',
  'waning_crescent',
]

// Mean length of a lunar cycle, days, and a known new moon to count from
const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 24 * 60 * 60 * 1000

export interface MoonInfo {
  phase: MoonPhase
  /** Lit share of the disc, 0–1 */
  illumination: number
}

/**
 * The moon phase at a moment, from the mean lunar cycle: accurate to about half a day, which is
 * plenty for a name and a percentage. The phase is the same everywhere on Earth.
 */
export function getMoonPhase(date: Date): MoonInfo {
  const days = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const cycle = age / SYNODIC_MONTH
  return {
    // Eight equal parts, each centred on its phase: new moon covers the last and first 1/16
    phase: PHASES[Math.round(cycle * 8) % 8],
    illumination: (1 - Math.cos(2 * Math.PI * cycle)) / 2,
  }
}
