// Open-Meteo returns local times of the city as "YYYY-MM-DDTHH:MM" (timezone=auto),
// so they are compared as naive timestamps without any timezone conversion.
function toMinutes(isoLocal: string): number {
  const [date, time = '00:00'] = isoLocal.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return Date.UTC(year, month - 1, day, hour, minute) / 60_000
}

/** Share of daylight that has passed (0–1), or null before sunrise / after sunset. */
export function getDaylightProgress(sunrise: string, sunset: string, now: string): number | null {
  const start = toMinutes(sunrise)
  const end = toMinutes(sunset)
  const current = toMinutes(now)

  if (end <= start || current < start || current > end) return null
  return (current - start) / (end - start)
}

export function formatDuration(
  seconds: number,
  units: { hours_short: string; minutes_short: string },
): string {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours} ${units.hours_short} ${minutes} ${units.minutes_short}`
}

export type UvLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'

/** WHO UV index categories */
export function getUvLevel(uvIndex: number): UvLevel {
  const uv = Math.round(uvIndex)
  if (uv < 3) return 'low'
  if (uv < 6) return 'moderate'
  if (uv < 8) return 'high'
  if (uv < 11) return 'very_high'
  return 'extreme'
}

/** Index in an 8-point compass list (N, NE, E, SE, S, SW, W, NW) for a direction in degrees. */
export function getCompassIndex(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360
  return Math.round(normalized / 45) % 8
}
