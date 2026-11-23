const STORAGE_KEY = 'weatherly_last_location'

export interface Coords {
  lat: number
  lon: number
}

function isValidCoords(value: unknown): value is Coords {
  if (typeof value !== 'object' || value === null) return false
  const { lat, lon } = value as Record<string, unknown>
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
  )
}

export function loadLastLocation(): Coords | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return isValidCoords(value) ? { lat: value.lat, lon: value.lon } : null
  } catch {
    return null
  }
}

export function saveLastLocation(coords: Coords): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: coords.lat, lon: coords.lon }))
  } catch {
    // Storage can be full or disabled (private mode) — remembering the city is optional
  }
}
